from __future__ import print_function

import sys
import os
import json
import requests
import ipdb
import lxml
import urllib
import pandas as pd
import uuid
from tqdm import tqdm
from pymongo import MongoClient

from venomkb_builder import VenomKB

ITIS_BASE = 'https://www.itis.gov/ITISWebService/jsonservice/'
NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'

VKB = VenomKB()
VKB.load_database()

preds = pd.read_csv('venomkb_v1_integration/smdb_search_toxprot_pmid_overlap.tsv',
                    sep='\t')

with open('frozen_data/uniprot_to_vkb_map.txt', 'r') as fp:
    vkbmap = fp.readlines()

vkbmap = [x.strip().split(',') for x in vkbmap]
vkbmap = dict((k, v) for (k, v) in vkbmap)

protein_predications = {}
for i, p in tqdm(preds.iterrows()):
    vkbid = vkbmap[p.toxprot_id]
    p_dict = dict(p)
    p_dict['id_pred'] = uuid.uuid4()  # use for comparison later, if needed
    protein_predications.setdefault(vkbid, []).append(p_dict)

ipdb.set_trace()

species_predications = {}
for s in tqdm(VKB.species):
    db_rep_spec = VKB.mongo_connection.species.find_one({'_id': s._mongo_id})
    found_predications = None
    this_species = []
    for p in db_rep_spec['venom']['proteins']:            
        try:
            found_predications = protein_predications[p]
        except KeyError:
            continue
        # this time, we make a dict of proteins
        for pp in found_predications:
            pp['vkb_protein_ref'] = p
        this_species.extend(found_predications)
    species_predications[s.venomkb_id] = this_species

# We've aggregated the predications, now we add them to the model
for k, v in tqdm(protein_predications.iteritems()):
    v_list = []
    if len(v) > 1:
        v_list = v
    else:
        v_list.append(v)
    ipdb.set_trace()
    VKB.mongo_connection.proteins.update_one(
        {'venomkb_id': k},
        {
            '$set': {
                'literature_predications': v_list
            }
        }
    )

for k, v in tqdm(species_predications.iteritems()):
    v_list = []
    if len(v) > 1:
        v_list = v
    else:
        v_list.append(v)
    VKB.mongo_connection.species.update_one(
        {'venomkb_id': k},
        {
            '$set': {
                'literature_predications': v_list
            }
        }
    )