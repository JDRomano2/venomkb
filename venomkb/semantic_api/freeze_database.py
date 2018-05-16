#!/usr/bin/env python
"""Standalone script for exporting the contents of VenomKB to Neo4j.

Eventually this script will be merged into a more comprehensive module
structure for VenomKB-related Python code.
"""

from __future__ import print_function, absolute_import

import json
import os
import requests

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
  def __init__(self):
    pass



if __name__ == '__main__':
  data = VenomkbData()
