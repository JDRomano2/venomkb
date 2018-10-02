#!/usr/bin/env python

from __future__ import print_function

import os, sys
import requests
import json
import ipdb
import pickle
from tqdm import tqdm
from lxml import etree
from collections import defaultdict
from StringIO import StringIO
import ipdb

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

OVERWRITE = False

testgraph = {'A': ['B', 'C'],
             'B': ['C', 'D'],
             'C': ['D'],
             'D': ['C'],
             'E': ['F'],
             'F': ['C']}


class Graph(object):
    """Graph data structure implemented using dictionaries.

    Adapted from https://www.python.org/doc/essays/graphs/, and
    targeted for Python 2.7."""
    
    def __init__(self, graph_as_dict={}):
        self._graph = graph_as_dict

    def __repr__(self):
        return "Graph of {0} nodes".format(len(self._graph))

    def has_key(self, key):
        return key in self._graph.keys()

    # def add_node(self, label, parents=[], c=[]):
    #     print(label)
    #     print(parents)
    #     print(c)
    #     try:
    #         assert set(parents).issubset(self._graph.keys())
    #         assert set(c).issubset(self._graph.keys())
    #         assert label not in self._graph.keys()
    #         self._graph[label] = c
    #         for p in parents:
    #             self._graph[p].append(label)
    #     except AssertionError:
    #         ipdb.set_trace()
    #         print("Uh oh!")

    def add_edge(self, parent, child):
        if parent in self._graph.keys():
            self._graph[parent].append(child)
        else:
            self._graph[parent] = [child]
        # Make sure child node exists. If not, create it
        if not child in self._graph.keys():
            #if child == 'GO:0044216':
            #    ipdb.set_trace()
            #self.add_node(label=child, parents)
            self._graph[child] = []

    def count_edges(self):
        """Self-explanatory - uses double list comprehension"""
        return len([l for sl in [x for x in g._graph.values()] for i in sl])

    def remove_node(self, label):
        # Remove the node
        if not self._graph.pop(label, False):
            return False
        # Remove all edges pointing to the node
        for k, v in self._graph.iterkeys():
            self._graph[k] = [x for x in v if x != label]
        return True

    def find_path(self, start, end, path=[]):
        """You should usually use find_shortest_path(),
        but if search efficiency is a concern this can be useful in a pinch."""
        path = path + [start]
        if start == end:
            return path
        if not self.has_key(start):
            return None
        for node in self._graph[start]:
            if node not in path:
                newpath = self.find_path(node, end, path)
                if newpath: return newpath
        return newpath

    def find_all_paths(self, start, end, path=[]):
        path = path + [start]
        if start == end:
            return [path]
        if not self.has_key(start):
            return []
        paths = []
        for node in self._graph[start]:
            if node not in path:
                newpaths = self.find_all_paths(node, end, path)
                for newpath in newpaths:
                    paths.append(newpath)
        return paths

    def find_shortest_path(self, start, end, path=[]):
        path = path + [start]
        if start == end:
            return path
        if not self.has_key(start):
            return None
        shortest = None
        for node in self._graph[start]:
            if node not in path:
                newpath = find_shortest_path(node, end, path)
                if newpath:
                    if not shortest or len(newpath) < len(shortest):
                        shortest = newpath
        return shortest

    def find_all_roots(self):
        """Any node that is not in the list of children of any other
        node must be a 'root'. The existence of one root does not imply
        a graph is a DAG, but it is a prerequisite for all DAGs.
        
        This isn't an efficient algorithm!

        Complexity: at least O(n^2)"""
        candidates = self._graph.keys()
        roots = []
        for c in candidates:
            if c not in [i for sl in self._graph.values() for i in sl]:
                roots.append(c)
        if len(roots) == 0:
            return None
        return roots

    def topological_sort(self):
        """Create a list of nodes where each node occurs before all
        of its children.

        Solution is not guaranteed to be unique, but all DAGs have at
        least one solution.

        For algorithm details refer to doi:10.1145/368996.369025"""
        L = []
        Q = self.find_all_roots()
        graph_copy = dict(self._graph)
        while len(Q) > 0:
            n = Q.pop()
            L.append(n)
            for m in graph_copy[n]:
                graph_copy[n] = [x for x in graph_copy[n] if x != m]
                if len([1 for k, v in graph_copy.iteritems() if m in v]) > 0:
                    Q.append(m)
        if bool([x for x in graph_copy.values() if x != []]):
            return False
        else:
            return L

    def is_dag(self):
        """If we can perform topological sort, then it is a DAG."""
        if self.topological_sort():
            return True
        else:
            return False


class GOgraph(Graph):
    def __init__(self):
        super(GOgraph, self).__init__()
        self._rel_table = defaultdict(dict)
        self.already_added = []

    quickgo_base = 'http://www.ebi.ac.uk/QuickGO-Old/'

    def add_term_with_ancestors(self, go_id):
        if go_id in self.already_added:
            return False
        obo = GOgraph.fetch_quickgo_by_term_id(go_id)
        relations = GOgraph.parse_quickgo_oboxml(obo)
        for x in relations:
            self.add_edge(go_id, x['id'])
            self._rel_table[go_id][x['id']] = x['type']
            if x['id'] not in self.already_added:
                self.add_term_with_ancestors(x['id'])
        self.already_added.append(go_id)
        return relations

    @classmethod
    def fetch_quickgo_by_term_id(cls, id):
        """Sample ID: GO:0003824"""
        url_suffix = 'GTerm?id={0}&format=oboxml'.format(id)
        r = requests.get(GOgraph.quickgo_base + url_suffix)
        oboxml = r.text
        et = etree.parse(StringIO(oboxml))
        return et

    @classmethod
    def parse_quickgo_oboxml(cls, quickgo_xml):
        is_a = quickgo_xml.xpath('/obo/term/is_a')
        relationships = quickgo_xml.xpath('/obo/term/relationship')
        is_a_terms = [x.text.strip() for x in is_a]
        terms = []
        for rt in relationships:
            reltype = rt.xpath('type')[0].text.strip()
            relid = rt.xpath('to')[0].text.strip()
            terms.append({'type': reltype,
                          'id': relid})
        for i in is_a_terms:
            terms.append({'type': 'is_a',
                          'id': i})
        return terms

    @classmethod
    def reltolabel(cls, relation):
        return "{0};{1}".format(relation['type'], relation['id'])


if __name__=="__main__":
    print("Loading flat GO annotations...")
    go_by_prot = []
    if OVERWRITE:
        for v in tqdm(VKB.proteins):
            try:
                mts = []
                vkbid = v.venomkb_id
                # fetch from venomkb API
                r = requests.get('http://venomkb.org/api/proteins/' + vkbid)
                ven = json.loads(r.text)[0]
                go = ven['go_annotations']
                go_by_prot.append({'vkbid': v.venomkb_id,
                                   'go_annotations': go})
            except:
                pass
        with open('go_annotations.pkl', 'wb') as fp:
            pickle.dump(go_by_prot, fp)
    else:
        with open('go_annotations.pkl', 'rb') as fp:
            go_by_prot = pickle.load(fp)

    print("Using QuickGO API to build hierarchies...")
    g = GOgraph()
    for gbp in tqdm(go_by_prot):
        for go in gbp['go_annotations']:
            if not str(go['id']) in g.already_added:
                g.add_term_with_ancestors(str(go['id']))
    with open('go_graph.pkl', 'wb') as fp:
        pickle.dump(g, fp)
