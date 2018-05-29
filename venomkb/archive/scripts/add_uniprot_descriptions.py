from __future__ import print_function

import json
import xmltodict
import ipdb
import requests
from pymongo import MongoClient

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

count = 0
for p in VKB.proteins:
    # get uniprot id
    upid = p.out_links['UniProtKB']['id']
    upurl = "http://www.uniprot.org/uniprot/{0}.xml".format(upid)
    r = requests.get(upurl)
    try:
        data = xmltodict.parse(r.text)
    except:
        continue  # If there's an issue parsing, just move onward
    all_comments = data['uniprot']['entry']['comment']
    function = ""
    for c in all_comments:
        if c['@type'] == 'function':
            try:
                function = c['text']['#text']
            except TypeError:
                function = c['text']
            break
    if function == "":
        print("WARNING: No comment for {0}".format(p.name))
        continue
    count += 1
    print(count)

    VKB.mongo_connection.proteins.update_one(
        {'_id': p._mongo_id},
        {
            '$set': {
                'description': function
            }
        }
    )

