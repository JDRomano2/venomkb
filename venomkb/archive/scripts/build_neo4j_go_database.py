from __future__ import print_function

from neo4j.v1 import GraphDatabase, basic_auth
import os, sys
import json
import pickle
import ipdb
from tqdm import tqdm

from infer_effects_go import Graph, GOgraph

clear_string = '''
MATCH (n)
DETACH DELETE n
'''[1:-1]

# DOMAIN MODEL
# (:Annotation {go_id})-[:


with open('go_graph.pkl', 'rb') as fp:
    go_graph = pickle.load(fp)

# with open('go_graph_neo4j_input.csv', 'w') as fp:
#     print('child,relation,parent', file=fp)
#     for child, parents in tqdm(go_graph._rel_table.iteritems()):
#         for k, v in parents.iteritems():
#             print('{0},{1},{2}'.format(child, v, k), file=fp)



class GoGraphDatabase(object):
    def __init__(self, clear=False):
        self._driver = GraphDatabase.driver("bolt://127.0.0.1:7687/",
                                            auth=basic_auth("neo4j", "fffan77"))
        if clear:
            with self._driver.session() as session:
                session.run(clear_string)

    def add_term(self, go_id):
        with self._driver.session() as session:
            session.write_transaction(self.create_go_term_node, go_id)

    def add_rel_dep(self, go_id_1, go_id_2, rel_desc = 'IS_A'):
        if (not go_id_1) or (not go_id_2):
            return False
        with self._driver.session() as session:
            session.write_transaction(self.create_go_edge, goid1=go_id_1, goid2=go_id_2, rel_desc=rel_desc)

    def add_rel(self, go_id_1, go_id_2, rel_desc = 'is_a'):
        querystr = ("MATCH (g1:GoTerm {go_id: $go_id_1 }), (g2:GoTerm {go_id: $go_id_2 }) "
                    "CREATE (g1)-[:%s]->(g2)") % rel_desc
        with self._driver.session() as session:
            session.run(querystr,
                        go_id_1=go_id_1,
                        go_id_2=go_id_2)

    @staticmethod
    def create_go_term_node(tx, go_id):
        tx.run("CREATE (a:GoTerm {go_id: $go_id})", go_id=go_id)

    @staticmethod
    def create_go_edge(tx, goid1, goid2, rel_desc):

        tx.run("MATCH (g1:GoTerm {go_id: $goid1 }), (g2:GoTerm {go_id: $goid2 }) CREATE (g1)-[:IS_A]->(g2)")


g = GoGraphDatabase(clear = True)
# first, create nodes
for k in go_graph._graph.iterkeys():
    g.add_term(k)

# # now, create edges
# for k, v in go_graph._graph.iteritems():
#     for x in v:
#         print(k, x)
#         if x and k:
#             g.add_rel(go_id_1=k, go_id_2=x)

# create edges with appropriate relationship info
for k, v in go_graph._rel_table.iteritems():
    for x, y in v.iteritems():
        print(k, y, x)
        g.add_rel(go_id_1=k, go_id_2=x, rel_desc=y)
