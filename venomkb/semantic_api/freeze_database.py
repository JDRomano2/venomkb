#!/usr/bin/env python
"""Standalone script for exporting the contents of VenomKB to Neo4j.

Eventually this script will be merged into a more comprehensive module
structure for VenomKB-related Python code.
"""

from __future__ import print_function, absolute_import

import json
import os
import requests
import configparser
from neo4j.v1 import GraphDatabase
import time
import unittest

ENVIRONMENT = 'DEV'

config = configparser.ConfigParser()
config.read('./venomkb-neo4j.cfg')

HOSTNAME = config[ENVIRONMENT]['Hostname']
USER = config[ENVIRONMENT]['User']
PASSWORD = config[ENVIRONMENT]['Password']
PORT = config['DEFAULT']['Port']
URI = "bolt://{0}:{1}".format(HOSTNAME, PORT)

__author__ = "Joseph D. Romano and Marine Saint Mezard"
__copyright__ = "Copyright 2018, The Tatonetti Lab"
__credits__ = ["Joseph D. Romano", "Marine Saint Mezard"]
__license__ = "MIT"
__version__ = "1.0.0-alpha"
__maintainer__ = "Joseph D. Romano"
__email__ = "jdr2160@cumc.columbia.edu"
__status__ = "Development"

VENOMKB_API = "http://venomkb.org/api/"


class VenomkbData(object):
  def __init__(self):
    print("Fetching data from VenomKB's REST API.")
    self.proteins = VenomkbData.fetch_proteins()
    self.species = VenomkbData.fetch_species()

  @staticmethod
  def fetch_proteins():
    r = requests.get(VENOMKB_API + 'proteins')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

  @staticmethod
  def fetch_species():
    r = requests.get(VENOMKB_API + 'species')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()


class Neo4jWriter(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_generate_graph(self, proteins, species_list, categories):
    """This function create a neo4j graph.

          Args:
            proteins (array of object):  An array containing all the proteins that will be add to the graph.
            Each protein should at least has a name, a venomkb_id, an annotation score, an aa_sequence and a UnitProtKB_id.
            A protein can also have literature predication, separate nodes will be created and linked, and some gene
            ontologies, separate nodes will be created and linked.

            species (array of object): An array of object containing all the species that will be add as nodes to the graph.
            Each species should at least have a name, a venomkb_id, a score and a list a protein.

            categories (array of string): an array containing all the ontology class.

          Returns:
            A neo4j graph located in /neo4j-community-3.4/data/databases/graph.db
      """
    self.purge()
    # add category
    for category in categories:
      self.print_category_nodes(category)

    self.print_is_a_subclass_relationship("Peptide", "Biological_Macromolecule")
    self.print_is_a_subclass_relationship("Carbohydrate", "Biological_Macromolecule")
    self.print_is_a_subclass_relationship("Biological_Macromolecule", "Molecule")
    self.print_is_a_subclass_relationship("Inorganic_Molecule", "Molecule")
    self.print_is_a_subclass_relationship("Whole_Venom_Extract", "Mixture")
    self.print_is_a_subclass_relationship("Molecule", "Chemical_Compound")
    self.print_is_a_subclass_relationship("Mixture", "Chemical_Compound")
    self.print_is_a_subclass_relationship("Synthetic_Venom_Derivative", "Chemical_Compound")
    self.print_is_a_subclass_relationship("Chemical_Compound", "Venom")
    self.print_is_a_subclass_relationship("Venomous_Organism", "Thing")
    self.print_is_a_subclass_relationship("Venom", "Thing")

    pfam_added = []
    # add proteins
    for protein in proteins:
      self.print_protein(protein["name"], protein["venomkb_id"], protein["annotation_score"], protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])

      if 'Pfam' in protein["out_links"]:
        pfam = protein["out_links"]["Pfam"]["attributes"]["name"]
        if pfam not in pfam_added:
          self.print_pfam_node(pfam)
          pfam_added.append(pfam)
        self.print_pfam_relationship(protein["venomkb_id"], pfam)

      if 'go_annotations' in protein:
        for elt in protein["go_annotations"]:
          self.print_is_a_go_relation_and_node(protein["venomkb_id"], elt["evidence"], elt["term"], elt["id"], elt["project"])

      if 'literature_predications' in protein:
        if type(protein["literature_predications"][0])==list:
          for elt in protein["literature_predications"][0]:
            self.print_predication_relation_and_node(protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])
        else:
          for elt in protein["literature_predications"]:
            self.print_predication_relation_and_node(protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])

  # add species
    for species in species_list:
      self.print_species(species["name"], species["venomkb_id"], species["annotation_score"])
      for protein in species["venom"]["proteins"]:
        self.print_link(species["name"], protein)

  def print_species(self, name, venomkb_id, score):
    """This function create a species node into the graph.
    It links the node to the Venomous_Organism node with a "is instance of" link.

          Args:
            name (string): the species'name
            venomkb_id (string): a unique identifier for the species, must start with a 'S'
            score (int): an annotation score for the data between 1 and 5

          Returns:
            No return
      """
    with self._driver.session() as session:
      species = session.write_transaction(self._add_species, (name, venomkb_id, score))
      print(species)

  def print_protein(self, name, venomkb_id, score, aa_sequence, UnitProtKB_id):
    """This function create a protein node into the graph.
    It links the node to the Peptide node with a "is instance of" link

          Args:
            name (string): the protein's name
            venomkb_id (string): a unique identifier for the protein, must start with a 'P'
            score (int): an annotation score for the data between 1 and 5
            aa_sequence (string): amino acid sequence of the protein
            UnitProtKB_id (string)

          Returns:
            No return
      """
    with self._driver.session() as session:
      protein = session.write_transaction(self._add_protein, (name, venomkb_id, score, aa_sequence, UnitProtKB_id))
      print(protein)

  def print_category_nodes(self, name):
    """This function create an ontology class node into the graph.

          Args:
            name (string): the name of the ontology class

          Returns:
            No return
    """
    with self._driver.session() as session:
      category = session.write_transaction(self._add_nodes_category, name)
      print(category)

  def print_pfam_node(self, pfam):
    """This function create a protein family (alias pfam) node into the graph.

          Args:
            name (string): the protein family's name

          Returns:
            No return
    """
    with self._driver.session() as session:
      pfam = session.write_transaction(self._add_nodes_pfam, pfam)
      print(pfam)

  def print_link(self, species, protein_id):
    """This function add a link between a species and a protein into the graph.

          Args:
            species (string): the name of the species that will be linked
            protein_id (string): the venomkb_id of the protein that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_relationship, (species, protein_id))
      print(relationship)

  def print_protein_peptide_relationship(self, protein_id):
    """This function add a link between a protein and the "Peptide" node which is an onlogy class.

          Args:
            protein_id (string): the venomkb_id of the protein that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_protein_peptide_relationship, protein_id)
      print(relationship)

  def print_specie_organism_relationship(self, species_id):
    """This function add a link between a species and the "Venomous Organism" node which is an onlogy class.

          Args:
            species_id (string): the venomkb_id of the species that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_species_organism_relationship, species_id)
      print(relationship)


  def print_is_a_subclass_relationship(self, category_a, category_b):
    """This function add a link between 2 onlogy classes : "a is a subclass of b"

          Args:
            category_a (string): the name of the onlogy class
            category_b (string): the name of the onlogy class

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_is_a_relationship, (category_a, category_b))
      print(relationship)

  def print_pfam_relationship(self, protein_id, pfam):
    """This function add a link a protein and a pfam.

          Args:
            protein_id (string): the venomkb_id of the protein
            pfam (string): the name of protein family

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_pfam_relation, (protein_id, pfam))
      print(relationship)

  def print_is_a_go_relation_and_node(self, protein_id, evidence, term, go_id, project):
    """This function create a node for a gene ontology, and link this node to the correct protein.

          Args:
            protein_id (string): the venomkb_id of the protein
            evidence (string): evidence of the gene ontology
            term (string): term of the gene ontology
            go_id (string): a specific id for the gene ontology
            project (string): the name of the project in the gene ontology

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_is_a_go_relation_and_node, (protein_id, evidence, term, go_id, project))
      print(relationship)

  def print_predication_relation_and_node(self, protein_id,  s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid):
    """This function create a node for a literature predication, and link this node to the correct protein.

          Args:
            protein_id (string): the venomkb_id of the protein
            s_name (string):
            s_cui (string):
            s_type (string):
            o_cui (string):
            o_name (string):
            o_type (string):
            predicate (string):
            pmid (string):

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_predication_relation_and_node, (protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid))
      print(relationship)

  def purge(self):
    """This function all elements from the database

          Args:
            No args

          Returns:
            The transactions that deleted all elements
    """

    with self._driver.session() as session:
      del_all = session.write_transaction(self._purge_db_contents)
      return del_all



  @staticmethod
  def _add_species(tx, payload):
    (name, venomkb_id, score) = payload
    statement  = """MATCH (b:OntologyClass) WHERE b.name = "Venomous_Organism"
                    CREATE (a:Species {name : {name}, vkbid: {venomkb_id}, score:{score}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
    result = tx.run(statement, name=name, venomkb_id=venomkb_id, score=score)
    return result.single()[0]

  @staticmethod
  def _add_protein(tx, payload):
    (name, venomkb_id , score, aa_sequence, UnitProtKB_id) = payload
    statement  = """MATCH (b:OntologyClass) WHERE b.name = "Peptide"
                    CREATE (a:Protein {name : {name}, vkbid: {venomkb_id}, score:{score}, aa_sequence: {aa_sequence}, UnitProtKB_id: {UnitProtKB_id}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
    result = tx.run(statement, name=name, venomkb_id=venomkb_id, score=score, aa_sequence=aa_sequence, UnitProtKB_id=UnitProtKB_id)
    return result.single()[0]

  @staticmethod
  def _add_nodes_category(tx, name):
    statement = """CREATE (a:OntologyClass {name : {name}})
                   RETURN a.name +', from node ' + id(a)"""
    result = tx.run(statement, name=name)
    return result.single()[0]

  @staticmethod
  def _add_nodes_pfam(tx, name):
    statement = """CREATE (a:Pfam {name : {name}})
                RETURN a.name +', from node ' + id(a)"""
    result = tx.run(statement, name=name)
    return result.single()[0]

  @staticmethod
  def _add_relationship(tx, payload):
    (species, protein_id) = payload
    statement = """MATCH (a:Species {name: {species}}),
                (b:Protein {vkbid : {protein_id}})
                CREATE (a)-[r:HAS_VENOM_COMPONENT]->(b)
                RETURN r"""
    result = tx.run(statement, {"species": species, "protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_protein_peptide_relationship(tx, protein_id):
    statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:OntologyClass {name : "Peptide"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_species_organism_relationship(tx, species_id):
    statement = """MATCH (a:Species {vkbid : {species_id}}),
                (b:OntologyClass {name : "Venomous_Organism"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"species_id": species_id})
    return result.single()[0]

  @staticmethod
  def _add_is_a_relationship(tx, categories):
    (category_a, category_b) = categories
    statement = """MATCH (a:OntologyClass {name : {category_a}}),
                (b:OntologyClass {name : {category_b}})
                CREATE (a)-[r:IS_A_SUBCLASS_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"category_a": category_a, "category_b": category_b})
    return result.single()[0]

  @staticmethod
  def _add_pfam_relation(tx, payload):
    (protein_id, pfam) = payload
    statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:Pfam  {name : {pfam}})
                CREATE (a)-[r:IS_A]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id, "pfam": pfam})
    return result.single()[0]

  @staticmethod
  def _add_is_a_go_relation_and_node(tx, payload):
    (protein_id, evidence, term, go_id, project) = payload
    statement = """MATCH (prot:Protein) where prot.vkbid={protein_id}
                CREATE (go:GeneOntology {goid:{go_id}, term:{term}, evidence:{evidence}, project:{project}})
                CREATE((prot)-[:HAS_A_GO]->(go))
                RETURN go"""
    result = tx.run(statement, {"protein_id": protein_id, "go_id": go_id, "term": term, "evidence":evidence, "project":project})
    return result.single()[0]

  @staticmethod
  def _add_predication_relation_and_node(tx, payload):
    (protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid) = payload
    statement = """MATCH (p:Protein) where p.vkbid={protein_id}
                CREATE (lp:Predication {s_name:{s_name}, s_cui:{s_cui}, s_type:{s_type}, o_cui:{o_cui}, o_name:{o_name}, o_type:{o_type}, predicate:{predicate}, pmid:{pmid}})
                CREATE((p)-[:HAS_A_PL]->(lp))
                RETURN lp"""
    result = tx.run(statement, {"protein_id": protein_id, "s_name": s_name, "s_cui": s_cui, "s_type":s_type, "o_name": o_name, "o_cui": o_cui, "o_type":o_type, "predicate":predicate, "pmid":pmid})
    return result.single()[0]

  @staticmethod
  def _purge_db_contents(tx):
    result = tx.run("MATCH (n)"
                    "DETACH DELETE n")
    return result

class NeoSimpleStat(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_count_proteins(self):
    """This function count the number of protein nodes

          Args:
            No args

          Returns:
            nb_proteins (int) : number of protein nodes in the graph
    """
    with self._driver.session() as session:
      nb_proteins = session.write_transaction(self._get_proteins_count)
      print("There are ", nb_proteins, " protein nodes.")
      return nb_proteins

  def print_count_species(self):
    """This function count the number of species nodes

          Args:
            No args

          Returns:
            nb_species (int) : number of species nodes in the graph
    """
    with self._driver.session() as session:
      nb_species = session.write_transaction(self._get_species_count)
      print("There are ", nb_species, " species nodes.")
      return nb_species

  def print_count_nodes(self):
    """This function count the number of nodes per category

          Args:
            No args

          Returns:
            nb_nodes (array of tuple (category_name, number_of_nodes)) : the array is order by category_name.
    """
    with self._driver.session() as session:
      nb_nodes = session.write_transaction(self._get_count_nodes)
      print(nb_nodes[0][1])
      print("There are ", nb_nodes[0][1], "gene ontologies")
      print("There are ", nb_nodes[1][1], "categories")
      print("There are ", nb_nodes[2][1], "protein families")
      print("There are ", nb_nodes[3][1], "predications")
      print("There are ", nb_nodes[4][1], "proteins")
      print("There are ", nb_nodes[5][1], "species")
      return nb_nodes

  def print_information_species(self, species_name):
    """This function print information about a given species
          Args:
            species_name (string) : the name of the species

          Returns:
            species (array) : [name , venombk_id, score,
            number of relation has_venom_component, number of relation is instance of]
    """
    with self._driver.session() as session:
      species = session.write_transaction(self._get_info_species, species_name)
      return species

  def print_information_protein(self, protein_id):
    """This function print information about a given protein
          Args:
            protein_id (string) : the venomkb_id of the protein

          Returns:
            protein_info (array) : [name , score, UnitProtKB_id, aa_sequence,
            number of relation has_venom_component, number of relation is instance of
            name of the species that is linked to the protein, ontology class name]
    """
    with self._driver.session() as session:
      protein_info = session.write_transaction(self._get_info_protein, protein_id)
      return protein_info

  def print_pfam(self, protein_id):
    """This function print information the protein family
          Args:
            protein_id (string) : the venomkb_id of the protein

          Returns:
            pfam (string) : the family protein name if exists
    """
    with self._driver.session() as session:
      pfam = session.write_transaction(self._get_pfam, protein_id)
      print(pfam)
      return pfam

  def print_is_instance_relation(self):
    """This function print information the relationship "IS INSTANCE OF"
          Args:
            No args
          Returns:
            relationship (array) : [nb of protein, nb of species
            number of relation wwith protein, number of relation with species]
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._get_is_instance_of)
      return relationship

  def print_has_a_pl_relation(self):
    """This function print information the relationship "HAS A PL"
          Args:
            No args
          Returns:
            relationship (array) : [nb of predication literature, nb of relationship HAS A PL]
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._get_has_a_pl)
      return relationship

  def print_statistics(self):
    """This function print istatistics about the graph
          Args:
            No args
          Returns:
            stats (array of Record) : [[label, sample size, avg Property Count,
            Min Property Count, Max Property Count, Avg RelationShip Count,
            Min Relationship count, max relationship count]]
    """
    with self._driver.session() as session:
      stats = session.write_transaction(self._get_statistics)
      print(stats)
      return stats

  @staticmethod
  def _get_info_species(tx, species_name):
    statement =""" MATCH (p:Species) WHERE p.name={species_name}
                   MATCH (p)-[r:HAS_VENOM_COMPONENT]->(m)
                   MATCH (p)-[:IS_INSTANCE_OF]->(c:OntologyClass)
                   RETURN p.name, p.vkbid, p.score, count( distinct r), count(distinct c)"""
    result = tx.run(statement, {"species_name": species_name})
    print("species", result)
    return result.single()

  @staticmethod
  def _get_info_protein(tx, protein_id):
    statement ="""MATCH (p:Protein) WHERE p.vkbid={protein_id}
               MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p)
               MATCH (p)-[:IS_INSTANCE_OF]->(c:OntologyClass)
               RETURN p.name, p.score, p.UnitProtKB_id, p.aa_sequence, count(s),  count(c), s.name,  c.name"""
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()

  @staticmethod
  def _get_pfam(tx, protein_id):
    statement ="""MATCH (p:Protein) WHERE p.vkbid={protein_id}
               MATCH (p)-[:IS_A]->(f:Pfam)
               RETURN f.name """
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()

  @staticmethod
  def _get_proteins_count(tx):
    statement = "MATCH (p:Protein) RETURN count(p)"
    result = tx.run(statement)
    return result.single()[0]

  @staticmethod
  def _get_species_count(tx):
    statement = "MATCH (p:Species) RETURN count(p)"
    result = tx.run(statement)
    return result.single()[0]

  @staticmethod
  def _get_count_nodes(tx):
    statement = """MATCH (n)
                RETURN
                DISTINCT labels(n),
                count(*) order by labels(n)"""
    return list(tx.run(statement))

  @staticmethod
  def _get_is_instance_of(tx):
    statement = """MATCH (p:Protein), (s:Species)
                   MATCH (p)-[r:IS_INSTANCE_OF]->(m)
                   MATCH (s)-[q:IS_INSTANCE_OF]->(m)
                   RETURN count(DISTINCT p), count(DISTINCT s), count(DISTINCT r), count(DISTINCT q)"""
    result = tx.run(statement)
    return result.single()

  @staticmethod
  def _get_has_a_pl(tx):
    statement = """MATCH (p:Predication)
                   MATCH (m)-[r:HAS_A_PL]->(p)
                   RETURN count(DISTINCT r), count( DISTINCT p)"""
    result = tx.run(statement)
    return result.single()

  @staticmethod
  def _get_statistics(tx):
    statement = """MATCH (n)
                RETURN
                DISTINCT labels(n),
                count(*) AS SampleSize,
                avg(size(keys(n))) as Avg_PropertyCount,
                min(size(keys(n))) as Min_PropertyCount,
                max(size(keys(n))) as Max_PropertyCount,
                avg(size( (n)-[]-() ) ) as Avg_RelationshipCount,
                min(size( (n)-[]-() ) ) as Min_RelationshipCount,
                max(size( (n)-[]-() ) ) as Max_RelationshipCount"""
    return list(tx.run(statement))



class TestNeoMethods(unittest.TestCase):

    def test_number_of_data(self):
      # test fetches data
      data = VenomkbData()
      categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]

      self.assertEqual(len(data.species), 632)
      self.assertEqual(len(data.proteins), 6236)

      # test number of nodes
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_count_nodes()
      print(nb)
      self.assertEqual(nb[5][1], len(data.species))
      self.assertEqual(nb[4][1], len(data.proteins))
      self.assertEqual(nb[1][1], len(categories))

      nb_predication = 0
      for protein in data.proteins:
        if 'literature_predications' in protein:
          nb_predication += len(protein["literature_predications"])
      self.assertEqual(nb[3][1], nb_predication)

      nb_gene_ontology = 0
      for protein in data.proteins:
        if 'go_annotations' in protein:
          nb_gene_ontology += len(protein["go_annotations"])
      self.assertEqual(nb[0][1], nb_gene_ontology)


    def test_relationship_IS_INSTANCE_OF(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_is_instance_relation()
      self.assertEqual(nb[0],nb[2])
      self.assertEqual(nb[1], nb[3])

    def test_relationship_has_a_pl(self):
      # check that the number of predication is equal to the nb of has_a_pl relation
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_has_a_pl_relation()
      self.assertEqual(nb[0],nb[1])


    def test_properties_protein(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      # Protein example : Phospholipase A1 "P6421031"
      properties = neo.print_information_protein("P6421031")
      self.assertEqual(properties[0], "Phospholipase A1")
      self.assertEqual(properties[1], 5)
      self.assertEqual(properties[2], "P51528")
      self.assertEqual(properties[3], "GPKCPFNSDTVSIIIETRENRNRDLYTLQTLQNHPEFKKKTITRPVVFITHGFTSSASEKNFINLAKALVDKDNYMVISIDWQTAACTNEYPGLKYAYYPTAASNTRLVGQYIATITQKLVKDYKISMANIRLIGHSLGAHVSGFAGKRVQELKLGKYSEIIGLDPARPSFDSNHCSERLCETDAEYVQIIHTSNYLGTEKILGTVDFYMNNGKNNPGCGRFFSEVCSHTRAVIYMAECIKHECCLIGIPRSKSSQPISRCTKQECVCVGLNAKKYPSRGSFYVPVESTAPFCNNKGKII")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Vespula maculifrons")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Coagulation factor X-activating enzyme heavy chain "P3214280"
      properties = neo.print_information_protein("P3214280")
      self.assertEqual(properties[0], "Coagulation factor X-activating enzyme heavy chain")
      self.assertEqual(properties[1], 3)
      self.assertEqual(properties[2], "P86536")
      self.assertEqual(properties[3], "VATSEQFNKTFIELVIVVD")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Daboia russelii")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Short neurotoxin 2, "P9908634"
      properties = neo.print_information_protein("P9908634")
      self.assertEqual(properties[0], "Short neurotoxin 2")
      self.assertEqual(properties[1], 3)
      self.assertEqual(properties[2], "Q9W7K1")
      self.assertEqual(properties[3], "MKTLLLTLVMVTIMCLDLGYTLTCYKGYHDTVVCKPHETICYRYLIPATHGNAIPARGCGTSCPGGNHPVCCSTDLCNK")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Pseudonaja textilis")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Venom factor, "P9611075"
      properties = neo.print_information_protein("P9611075")
      self.assertEqual(properties[0], "Venom factor")
      self.assertEqual(properties[1], 4)
      self.assertEqual(properties[2], "J3S836")
      self.assertEqual(properties[3], "MEGMALYLVAALLIGFPASSFGALYTFITPGVLRTDTEEKILVEAHGDNAPKQLDISVHDFPRKQKILYQTRVDMNPAGGMLVTPTITIPAKDLNKDSRQNQYVVVQVTAPGLRLEKVVLLSYQSGFVFIQTDKGIYTPGSPVRYRVFSMDHNMHRMDKTVIVEFQTPQGIVVSSNPVNPASSLIRPYNLPELVSFGTWKAVAKYENSPEESYTALFDVREYVLPGFEVRVQPSEKFLYIDGNTDFHVSITARYLYGKRVEGVAFVLFGVKIDGNKKSIPESLTRIPIIDGDGEATLERHTLSRRFQRLNDLVGHNLYVSVTVITDSGSDMVVTEQSGIHIVTSPYQISFTKTPKYFKPGMPYELMVYVTNPDGSPAANVPVVSESIHSKGTTLSDGTAKLILNTPLNIQSLSITVKTNHRDLPRERQAMKSMTATAYQTQGGSGNYLHIAITSTEIKPGDNLPVSFNVRGNANSLNQIQYFTYLILTKGKIFKVGRQPRGAGQNLVTMTLPITPDLIPSFRFLAYYQVGNSEIVADSVWVDVKDTCMGTLVVKGASSRDNRIQKPGAAMKIKLEGDPGARVGLVAVDKAVYVLSDEYKISQTKIWDTIEKSDFGCTAGSGQNNLGVFEDAGLALATSTSLNTKQRSDAKCPQPENRRRRRSVVLLDSKASKAAQFPDQALRKCCEDGMHENPMGYSCEKREKYIQEGDACKAAFLECCRYIKGIHDENKREDELFLARSDFEDEFFGEDNIISRSDFPESWLWLTENLNAVPNNEGISSKTVPFYLRDSITTWEVLAVSITPTKGICVAEPYEITVMKDFFIDLRLPYSVVKNEQVEVRAILYNYVDDDIDVRVELLHNPAFCSVATETQRYRTQVTIKALSSWAVPFVIVPLQQGLHDIEVRASVRGQLASDGVKKKLKVVPEGMRKDIVTVIELDPSTKGVGGTQEQLVKANELDGKVPDTEIETKISVQGDRVAQIVENSIDGNKLSHLIITPSGCGEQNMITMTPSVIATYYLDTTGQWETLGVDRRTEAVQQIKKGYAQQLVYKKADHSYAAFVNRDSSSWLTAYVVKVFAMATKVVPDISHEIICGGVKWLILNRQQPDGVFKENAPVIHGEMLGGTKGAEPEVSLTAFILIALLESRSICNEHINILESSINKAADYLLKKYEKLQRPYTTALTAYALAAAGLLNDDRVLMAASTERNRWEEHNAYTYNIEGTSYALLALLKMEKFAEANPVVRWLTDQKYYGGTYGQTQATVVGFQGLAEYEIAMPSHKDLNLDIVIKLPEREVPISYRIDATNALRAQTTETKLNEDFTVSASGDGKATMTILTVYNAQLREDANVCNQFHLEVSVERIDSNLKQAKGAKETLKLKICTRYLGEVDSTMTIIDVSMLTGFLPDAEDLTRLSKGVDRYISKFEIDNNMAQKGAVIIYLDKVSHSEDECLQFRIQKHFEVGFIQPGSVKVYSYYNLDEQCTRFYHPDKGTGLLNKICHGNVCRCAEETCSLLNQQKKIDLQLRIQKACEPNVDYVYKAKLLRIEEKDASDIYVMDVLEVIKGGTDRNPQAKPRQYVSQRKCQEALNLKVNNDYLIWGLSSDLWHKKDEISYLITRNTWIERWPNEDECQDEEFQNLCNDFTQLSNTLTIFGCPN")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Crotalus adamanteus")
      self.assertEqual(properties[7], "Peptide")

    def test_pfam(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      res = neo.print_pfam("P6421031")
      self.assertEqual(res[0], "Lipase")
      res = neo.print_pfam("P3214280")
      self.assertEqual(res, None)
      res = neo.print_pfam("P9908634")
      self.assertEqual(res, None)

    def test_properties_species(self):
      # Species example Lachesana tarabaevi
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      properties = neo.print_information_species("Lachesana tarabaevi")
      self.assertEqual(properties[0], "Lachesana tarabaevi")
      self.assertEqual(properties[1], "S3801143")
      self.assertEqual(properties[2], 5)
      self.assertEqual(properties[3], 38)
      self.assertEqual(properties[4], 1)

      # Species example Lachesana tarabaevi
      properties = neo.print_information_species("Conus striatus")
      self.assertEqual(properties[0], "Conus striatus")
      self.assertEqual(properties[1], "S2192124")
      self.assertEqual(properties[2], 5)
      self.assertEqual(properties[3], 37)
      self.assertEqual(properties[4], 1)

if __name__ == '__main__':
  # properties = neo.print_information_protein("P0307338")
  neo = NeoSimpleStat(URI, USER, PASSWORD)
  # neo.print_count_nodes()
  res = neo.print_statistics()
  print(res[0])
  print(res[0][0])
  # unittest.main()
  # t1 = time.time()

  # data = VenomkbData()
  # categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]
  # neo = Neo4jWriter(URI, USER, PASSWORD)
  # neo.print_generate_graph(data.proteins, data.species, categories)

  # # neo.purge()
  # neo.print_category_nodes("Venomous_Organism")
  # neo.print_category_nodes("Peptide")
  # specie = data.species[0]
  # neo.print_species(specie["name"], specie["venomkb_id"], specie["annotation_score"])
  # protein = data.proteins[0]
  # neo.print_protein(protein["name"], protein["venomkb_id"], protein["annotation_score"], protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])
  # neo.print_link(specie["name"],protein["venomkb_id"])
  # t2 = time.time()
  # total = t2 - t1
  # print("It takes ", total, t2, t1)
