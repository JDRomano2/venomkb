from __future__ import print_function

import os, sys
import requests
import json
import ipdb
import pymongo
from tqdm import tqdm

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

VKB.mongo_connection.dbindexitems.delete_many({})

complete_index = []

print("Indexing proteins")
for p in tqdm(VKB.proteins):
    # find the species name for this protein
    # first, get the mongo representation
    mongo_rep = VKB.mongo_connection.proteins.find_one({'_id': p._mongo_id})
    venom_id = mongo_rep['venom_ref']
    species_id = venom_id.replace('V', 'S')
    species_name = [s.name for s in VKB.species if s.venomkb_id == species_id][0]

    score = mongo_rep['annotation_score']

    complete_index.append({
        "name": "{0} ({1})".format(p.name,species_name),
        "venomkb_id": p.venomkb_id,
        "data_type": "Protein",
        "annotation_score": score
    })

print("Indexing species")
for s in tqdm(VKB.species):
    mongo_rep = VKB.mongo_connection.species.find_one({'_id': s._mongo_id})
    score = mongo_rep['annotation_score']
    complete_index.append({
        "name": s.name,
        "venomkb_id": s.venomkb_id,
        "data_type": "Species",
        "annotation_score": score
    })

print("Indexing genomes")
for g in tqdm(VKB.genomes):
    mongo_rep = VKB.mongo_connection.genomes.find_one({'_id': g._mongo_id})
    score = mongo_rep['annotation_score']
    complete_index.append({
        "name": g.name,
        "venomkb_id": g.venomkb_id,
        "data_type": "Genome",
        "annotation_score": score
    })

print("Writing index to mongodb")
for i in tqdm(complete_index):
    VKB.mongo_connection.dbindexitems.insert_one(i)