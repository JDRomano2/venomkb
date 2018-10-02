#!/usr/bin/env python

from __future__ import print_function

import os, sys
import requests
import json
import ipdb
import cPickle as pickle
from tqdm import tqdm
from collections import defaultdict
# from pymongo import MongoClient

from venomkb_builder import VenomKB
from vkb_collections import *

VKB = VenomKB()
VKB.load_database()

OVERWRITE = False

systemic_effect_template = {
    "name": "",
    "venomkb_id": "",
    "proteins": [],
    "venoms": [],
    "eco_id": "ECO_0000322",
    "external_links": []
}

if os.name == 'nt':
    MESH_DATA_ROOT = "D:\\Data\\mesh\\2017\\"
else:
    MESH_DATA_ROOT = "/Users/jdr2160/data/mesh/2017/ascii/"
PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'


def parse_mesh_terms(medlinetext):
    terms = []
    for line in medlinetext.split('\n'):
        if line[:4] == u'MH  ':
            terms.append(line[6:])
    return terms


# Make MeSH data indices
# C: Diseases
# D: Chemicals/drugs
# ADD MORE

PASSWORD = os.environ['VENOMKB_STAGING_PW']
ADMIN_USER = 'venomkb-admin'
CLIENT = MongoClient(os.environ['MONGO_ADDR'])
VENOMKB = CLIENT['venomkb-staging']
# TEST_VENOMKB = CLIENT['venomkb-out-test']
VENOMKB.authenticate(ADMIN_USER, PASSWORD)

disease_stubs = ["C"]

DISEASES = {}
with open(MESH_DATA_ROOT + "mtrees2017.bin", 'r') as f:
    for line in f.readlines():
        code = line.split(';')[-1].strip()
        name = line.split(';')[0]
        if code[0] in disease_stubs:
            #DISEASES.append({'code': code, 'name': name})
            DISEASES[code] = name
disease_list = [v for k, v in DISEASES.iteritems()]

if OVERWRITE:
    mesh_by_prot = []
    for v in tqdm(VKB.proteins):
        try:
            mts = []
            vkbid = v.venomkb_id
            # fetch from venomkb API
            r = requests.get('http://venomkb.org/api/proteins/' + vkbid)
            ven = json.loads(r.text)[0]
            lit_refs = ven['literature_references']
            pmids = [x['pmid'] for x in lit_refs]
            for p in pmids:
                re = requests.get(PUBMED_BASE, params={'db': 'pubmed',
                                                       'rettype': 'MEDLINE',
                                                       'id': p})
                raw_mesh_terms = parse_mesh_terms(re.text)
                mts += raw_mesh_terms
            mesh_stumps = [x.split('/')[0].split('*')[-1] for x in mts]
            # any diseases?
            # annot_diseases = [x for x in mesh_roots if x in disease_list]
            # print(v.venomkb_id)
            # #print('ROOTS:')
            # #print(mesh_roots)
            # print('DISEASES:')
            # print(annot_diseases)
            # print()
            mesh_by_prot.append({'vkbid': v.venomkb_id,
                                 'mesh': mts,
                                 'mesh_stumps': mesh_stumps})
        except:
            print("Something bad happened---skipping protein {0}".format(v.venomkb_id))
    with open("mesh_stems.pkl", 'wb') as fp:
        pickle.dump(mesh_by_prot, fp)
else:
    mesh_by_prot = None
    with open("mesh_stems.pkl", 'rb') as fp:
        mesh_by_prot = pickle.load(fp)

if False:
    venomkb_mesh_diseases = defaultdict(list)
    for p in tqdm(mesh_by_prot):
        vkbid = p['vkbid']
        for ms in [x.strip() for x in p['mesh_stumps']]:
            if ms in disease_list:
                venomkb_mesh_diseases[ms].append(vkbid.strip())

    data = [(k, v) for k, v in venomkb_mesh_diseases.iteritems()]
    with open("vkbids_by_mesh_disease.pkl", 'wb') as fp:
        pickle.dump(data, fp)
else:
    with open("vkbids_by_mesh_disease.pkl", 'rb') as fp:
        data = pickle.load(fp)

print("Inserting new data")
for k, v in tqdm(data):
    current_doc = {
        "name": k,
        "venomkb_id": VKB._id_generator.new_id(type=SystemicEffect),
        "proteins": v,
        "venoms": [],
        "eco_id": "ECO_0000322",
        "external_links": []
    }
    VENOMKB.systemiceffects.insert_one(current_doc)
    print(current_doc)