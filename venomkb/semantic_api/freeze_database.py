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

  neo.purge()
