from __future__ import print_function
from pymongo import MongoClient
import ipdb
from tqdm import tqdm

from venomkb_builder import VenomKB


VKB = VenomKB()
VKB.load_database()

def rebuild_ncbi_taxonomy(in_dict):
    out_dict = {
        'db_name': 'ncbi_taxonomy',
        'id': in_dict['db_obj']['db_obj'],
        'attributes': {}
    }
    return out_dict

# Fix species db references
"""
for s in VKB.species:
    ncbi = s.out_links[0]
    replacement = {
        'ncbi_taxonomy': {
            'id': ncbi['id'],
            'attributes': {}
        }
    }
    # NOTE: We are replacing a dictionary with a list!!!!


    # update based on ID:

    VKB.mongo_connection.species.update_one(
        {'_id': s._mongo_id},
        {
            '$set': {
                'out_links': replacement
            }
        }
    )
"""

"""
# Embed venom in species document
for s in VKB.species:
    # find venom
    ven = VKB.mongo_connection.venoms.find_one({'species_ref': s.venomkb_id})
    
    # trim venom to have just what we want
    ven = {
        'name': ven['name'],
        'proteins': ven['proteins'],
        'out_links': ven['out_links']
    }

    # add venom to species
    VKB.mongo_connection.species.update_one(
        {'_id': s._mongo_id},
        {
            '$set': {
                'venom': ven
            }
        }
    )
"""

def get_attr_if_exists(dict_obj, attr_name):
    try:
        return dict_obj[attr_name]
    except KeyError:
        return None

for p in tqdm(VKB.proteins):
    # find protein
    prot = VKB.mongo_connection.proteins.find_one({'venomkb_id': p.venomkb_id})

    out_links = {}
    for _, ol in prot['out_links'].iteritems():
        name = ol['db_name']
        attributes = {}
        if isinstance(ol['db_obj'], unicode):
            cur_id = ol['db_obj']
            attributes['name'] = None
            attributes['term'] = None
        else:
            attributes['name'] = get_attr_if_exists(ol['db_obj'], 'entry name')
            attributes['term'] = get_attr_if_exists(ol['db_obj'], 'term')
            cur_id = ol['db_id']
        out_links[name] = {
            'id': cur_id,
            'attributes': attributes
        }

    VKB.mongo_connection.proteins.update_one(
        {'_id': p._mongo_id},
        {
            '$set': {
                'out_links': out_links
            }
        }
    )