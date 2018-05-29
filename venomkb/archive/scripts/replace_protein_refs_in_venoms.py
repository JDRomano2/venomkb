from __future__ import print_function
from pymongo import MongoClient
import ipdb
from tqdm import tqdm

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

vkbmap = {}

with open("./frozen_data/uniprot_to_vkb_map.txt", 'r') as fp:
    for line in fp.readlines():
        line = line.strip().split(',')    
        vkbmap[line[0]] = line[1]


for s in tqdm(VKB.species):
    species = VKB.mongo_connection.species.find_one({'venomkb_id': s.venomkb_id})
    venom = species['venom']
    proteins = venom['proteins']
    proteins_2 = [vkbmap[x] for x in proteins]
    venom['proteins'] = proteins_2
    ipdb.set_trace()
    """
    VKB.mongo_connection.species.update_one(
        {'_id': s._mongo_id},
        {
            '$set': {
                'venom': venom
            }
        }
    )
    """
