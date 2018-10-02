from __future__ import print_function, division
import ipdb
import os
import sys
import re
import json
import BeautifulSoup as soup
from lxml import etree
import requests
from pymongo import MongoClient
from tqdm import tqdm

UNIPROT_BASE = 'http://www.uniprot.org/uniprot/'
TOXPROT_PATH = UNIPROT_BASE + '?query=annotation%3A%28type%3A"tissue+specificity"+venom%29&sort=score'

# Get toxprot identifiers
r = requests.get(TOXPROT_PATH + '&format=list')
toxprot = r.text.split('\n')

peptides = {}
species = {}


# connect to db
client = MongoClient('mongodb://54.198.136.17:27017')


#########################
# STAGING
#########################
db = client['venomkb-staging']


for t in tqdm(toxprot):
    peptides[t] = {'out_links': {'UniProtKB': t}}

    uniprot_dump = requests.get(UNIPROT_BASE + t + '.xml')
    try:
        d = etree.fromstring(uniprot_dump.content)

        # Get protein data
        for elem in d[0]:
            # Process database references
            if elem.tag == "{http://uniprot.org/uniprot}dbReference":
                db_type = elem.attrib['type']
                props = {}
                props['id'] = elem.attrib['id']
                for prop in elem:
                    props[prop.attrib['type']] = prop.attrib['value']
                peptides[t]['out_links'][db_type] = props
                continue
            # Fetch sequence data
            if elem.tag == "{http://uniprot.org/uniprot}sequence":
                peptides[t]['aa_sequence'] = elem.text.lstrip().strip().replace('\n', '')
                continue
            # Update species info
            if elem.tag == "{http://uniprot.org/uniprot}organism":
                spec_data = {'taxid': None,
                             'scientific': None,
                             'common': None}
                for e2 in elem:
                    try:
                        if e2.attrib['type'] == "NCBI Taxonomy":
                            spec_data['taxid'] = e2.attrib['id']
                        if e2.attrib['type'] == "scientific":
                            spec_data['scientific'] = e2.text
                        if e2.attrib['type'] == "common":
                            spec_data['common'] = e2.text
                    except KeyError:
                        pass
                species[spec_data['taxid']] = {'scientific_name': spec_data['scientific'], 
                                               'common_name': spec_data['common']}
    except:
        print("skipping {0}".format(t))
## NEXT UP: Link the two related fields
#TODO


## NEXT UP: Insert data into MongoDB
db.proteins.delete_many( { } )
db.species.delete_many( { } )

[ db.proteins.insert_one(peptides[x]) for x in peptides ]
[ db.species.insert_one(species[y]) for y in species ]