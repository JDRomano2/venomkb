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

from . import neo_writer as ne

ENVIRONMENT = 'DEV'

CONFIG_FNAME = os.path.join(os.path.dirname(__file__), 'venomkb-neo4j.cfg')
print(CONFIG_FNAME)
config = configparser.ConfigParser()
config.read(CONFIG_FNAME)
print(config.keys())

HOSTNAME = config['DEV']['Hostname']
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
    self.genomes = VenomkbData.fetch_genomes()

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

  @staticmethod
  def fetch_genomes():
    r = requests.get(VENOMKB_API + 'genomes')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

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
      nb_nodes = {"gene ontologies": nb_nodes[0][1], "genomes": nb_nodes[1][1], "categories": nb_nodes[2][1],
                  "protein families": nb_nodes[3][1], "predications": nb_nodes[4][1], "proteins": nb_nodes[5][1], "species": nb_nodes[6][1]}
      print (nb_nodes)
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
      species = {"name" : species[0], "venomkb_id": species[1], "score": species[2], "nb_has_venom_component": species[3], "nb_is_instance_of": species[4]}
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
      protein = session.write_transaction(self._get_info_protein, protein_id)
      protein = {"name": protein[0], "score": protein[1], "UnitProtKB_id": protein[2],
                 "aa_sequence": protein[3], "nb_has_venom_component": protein[4], "nb_is_instance_of": protein[5], "species_name": protein[6], "ontology_class": protein[7]}

      return protein

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

  def print_genome(self, species_name):
    """This function print the genome name for a species if available
          Args:
            species_name (string) : the name of the given species

          Returns:
            genome (string) : the name of the genome if available, else None
    """
    with self._driver.session() as session:
      genome = session.write_transaction(self._get_genome, species_name)
      print(genome)
      return genome

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
  def _get_genome(tx, species_name):
    statement = """MATCH (s:Species) WHERE s.name={species_name}
                MATCH (s)-[:HAS_GENOME]->(g:Genome)
                RETURN g.name """
    result = tx.run(statement, {"species_name": species_name})
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

if __name__ == '__main__':
  # properties = neo.print_information_protein("P0307338")
  neo = NeoSimpleStat(URI, USER, PASSWORD)
  # neo.print_count_nodes()
  neo.print_genome("Lachesana tarabaevi")
  # res = neo.print_statistics()
  # print(res[0])
  # unittest.main()
  t1 = time.time()

  # data = VenomkbData()
  # categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]
  # neo = ne.Neo4jWriter(URI, USER, PASSWORD)
  # for genome in data.genomes:
  #     neo.genome(genome["name"], genome["venomkb_id"], genome["annotation_score"], genome["literature_reference"]["journal"],
  #                 genome["out_links"]["ncbi_genome"]["link"], genome["species_ref"], verbose=True)


  # neo.print_generate_graph(data.proteins, data.species, categories)

  # # neo.purge()
  # neo.print_category_nodes("Venomous_Organism")
  # neo.print_category_nodes("Peptide")
  # specie = data.species[0]
  # neo.print_species(specie["name"], specie["venomkb_id"], specie["annotation_score"])
  # protein = data.proteins[0]
  # neo.print_protein(protein["name"], protein["venomkb_id"], protein["annotation_score"], protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])
  # neo.print_link(specie["name"],protein["venomkb_id"])
  t2 = time.time()
  total = t2 - t1
  print("It takes ", total, " seconds")
