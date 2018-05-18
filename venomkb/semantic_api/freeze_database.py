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

  def print_species(self, name, venomkb_id):
    with self._driver.session() as session:
      species = session.write_transaction(self._add_species, (name, venomkb_id))
      print(species)

  def print_protein(self, name, venomkb_id):
    with self._driver.session() as session:
      protein = session.write_transaction(self._add_protein, (name, venomkb_id))
      print(protein)

  def print_category_nodes(self, name):
      with self._driver.session() as session:
        category = session.write_transaction(self._add_nodes_category, name)
        print(category)

  def print_link(self, species, protein_id):
     with self._driver.session() as session:
      relationship = session.write_transaction(self._add_relationship, (species, protein_id))
      print(relationship)

  def print_protein_peptide_relationship(self, protein_id):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_protein_peptide_relationship, protein_id)
      print(relationship)

  def print_specie_organism_relationship(self, species_id):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_species_organism_relationship, species_id)
      print(relationship)


  def print_is_a_relationship(self, category_a, category_b):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_is_a_relationship, (category_a, category_b))
      print(relationship)

  def purge(self):
    with self._driver.session() as session:
      del_all = session.write_transaction(self._purge_db_contents)
      return del_all

  @staticmethod
  def _add_species(tx, payload):
    (name, venomkb_id) = payload
    result = tx.run("CREATE (name:Species) "
                    "SET name.name = $name "
                    "SET name.vkbid = $venomkb_id "
                    "RETURN name.name +', '+ name.vkbid + ', from node ' + id(name)", name=name, venomkb_id=venomkb_id)
    return result.single()[0]

  @staticmethod
  def _add_protein(tx, payload):
    (name, venomkb_id) = payload
    result = tx.run("CREATE (a:Protein) "
                    "SET a.name = $name "
                    "SET a.vkbid = $venomkb_id "
                    "RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)", name=name, venomkb_id=venomkb_id)
    return result.single()[0]

  @staticmethod
  def _add_nodes_category(tx, name):
    result = tx.run("CREATE (a:Category) "
                    "SET a.name = $name "
                    "RETURN a.name +', from node ' + id(a)", name=name)
    return result.single()[0]

  @staticmethod
  def _add_relationship(tx, payload):
    (species, protein_id) = payload
    statement = """MATCH (a:Species) WHERE a.name = {species}
                MATCH (b:Protein) WHERE b.vkbid = {protein_id}
                CREATE (a)-[r:HAS_VENOM_COMPONENT]->(b)
                RETURN r"""
    result = tx.run(statement, {"species": species, "protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_protein_peptide_relationship(tx, protein_id):
    print(protein_id)
    statement = """MATCH (a:Protein) WHERE a.vkbid = {protein_id}
                MATCH (b:Category) WHERE b.name = {category}
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id, "category": "Peptide"})
    return result.single()[0]

  @staticmethod
  def _add_species_organism_relationship(tx, species_id):
    statement = """MATCH (a:Species) WHERE a.vkbid = {species_id}
                MATCH (b:Category) WHERE b.name = {category}
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"species_id": species_id, "category": "Venomous_Organism"})
    return result.single()[0]

  @staticmethod
  def _add_is_a_relationship(tx, categories):
    (category_a, category_b) = categories
    statement = """MATCH (a:Category) WHERE a.name = {category_a}
                MATCH (b:Category) WHERE b.name = {category_b}
                CREATE (a)-[r:IS_A]->(b)
                RETURN r"""
    result = tx.run(statement, {"category_a": category_a, "category_b": category_b})
    return result.single()[0]

  @staticmethod
  def _purge_db_contents(tx):
    result = tx.run("MATCH (n)"
                    "DETACH DELETE n")
    return result

if __name__ == '__main__':
  data = VenomkbData()
  neo = Neo4jWriter(URI, USER, PASSWORD)

  # add proteins
  for protein in data.proteins:
    neo.print_protein(str(protein["name"]), str(protein["venomkb_id"]))

  # add species
  for specie in data.species:
    neo.print_species(str(specie["name"]), str(specie["venomkb_id"]))

  # add link between species and proteins
  for specie in data.species:
    name = str(specie["name"])
    for protein_specie in specie["venom"]["proteins"] :
      neo.print_link(name, protein_specie)

  # add category node
  categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]
  for category in categories:
    neo.print_category_nodes(category)

  # connect proteins to peptide
  for protein in data.proteins:
    neo.print_protein_peptide_relationship(str(protein["venomkb_id"]))

 # connect species to Venomous_Organism
  for specie in data.species:
    neo.print_specie_organism_relationship(str(specie["venomkb_id"]))

  # add relation is_a

  neo.print_is_a_relationship("Peptide", "Biological_Macromolecule")
  neo.print_is_a_relationship("Carbohydrate", "Biological_Macromolecule")
  neo.print_is_a_relationship("Biological_Macromolecule", "Molecule")
  neo.print_is_a_relationship("Inorganic_Molecule", "Molecule")
  neo.print_is_a_relationship("Whole_Venom_Extract", "Mixture")
  neo.print_is_a_relationship("Molecule", "Chemical_Compound")
  neo.print_is_a_relationship("Mixture", "Chemical_Compound")
  neo.print_is_a_relationship("Synthetic_Venom_Derivative", "Chemical_Compound")
  neo.print_is_a_relationship("Chemical_Compound", "Venom")
  neo.print_is_a_relationship("Venomous_Organism", "Thing")
  neo.print_is_a_relationship("Venom", "Thing")
