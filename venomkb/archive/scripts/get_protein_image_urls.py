from __future__ import print_function

import os
import sys
import json
import requests
import ipdb
import xmltodict
import lxml
from pymongo import MongoClient
from tqdm import tqdm

from venomkb_builder import VenomKB

PDB_BASE_URL_PREFIX = 'http://www.rcsb.org/pdb/rest/getBlastPDB1?sequence='
PDB_BASE_URL_SUFFIX = '&eCutOff=10.0&matrix=BLOSUM62&outputFormat=XML'

PDB_IMG_URL_PREFIX = 'http://www.rcsb.org/pdb/images/'
PDB_IMG_URL_SUFFIX = '_bio_r_250.jpg'

VKB = VenomKB()
VKB.load_database()

counter = 0
image_url_index = []
for p in VKB.proteins:
    # does the species have a reference to PDB?
    try:
        known_3d_structure = False
        best_pdb_id = None
        if ("PDB" in p.out_links.keys()):
            known_3d_structure = True
            best_pdb_id = p.out_links['PDB']['id']
            print("Already a match for {0}".format(p.venomkb_id))
        else:
            # Search PDB using BLAST
            r = requests.get(PDB_BASE_URL_PREFIX + p.aa_sequence + PDB_BASE_URL_SUFFIX)        
            data = xmltodict.parse(r.text)
            print("Searching URL: {0}".format(PDB_BASE_URL_PREFIX + p.aa_sequence + PDB_BASE_URL_SUFFIX))
            try:
                best_pdb_id = data['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']['Hit'][0]['Hit_def'].split(':')[0]
            except KeyError: # 1 result or fewer
                try:
                    best_pdb_id = data['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']['Hit']['Hit_def'].split(':')[0]
                except KeyError:  # No results
                    best_pdb_id = ""

        if best_pdb_id != "":    
            image_url_index.append([
                p._mongo_id.__str__(),
                known_3d_structure,
                "{0}{1}{2}".format(PDB_IMG_URL_PREFIX, best_pdb_id, PDB_IMG_URL_SUFFIX)
            ])
        else:
            image_url_index.append([
                p._mongo_id.__str__(),
                known_3d_structure,
                ""
            ])
    except Exception:  # if an XML parsing error occurred, just skip it
        pass


with open('image_url_index.json', 'w') as fp:
    json.dump(image_url_index, fp)