from __future__ import print_function

# DESCRIPTION: Script for adding taxonomic information to 'species' records in VenomKB

import sys
import os
import json
import requests
import ipdb
import lxml
import urllib
from pymongo import MongoClient

from venomkb_builder import VenomKB

ITIS_BASE = 'https://www.itis.gov/ITISWebService/jsonservice/'
NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'

VKB = VenomKB()
VKB.load_database()

def find_species_names(xml_text):
    """Find species name and synonyms via NCBI taxonomy data"""
    taxon = lxml.etree.fromstring(xml_text)[0]
    sname = taxon.find("ScientificName").text
    other_names = taxon.find("OtherNames")
    synonyms = []
    if other_names != None:
        for name in other_names:
            if name.tag == 'Synonym':
                synonyms += [name.text]
    return [sname] + synonyms

def print_formatted_h_list(h_list):
    subsp_penalty = 0
    for i in xrange(len(h_list)):
        leading_spaces = " " * (i - subsp_penalty)
        print(leading_spaces + h_list[i]['rankName'] + ": " + h_list[i]['taxonName'])
        if h_list[i]['rankName'] == 'Subspecies':
            subsp_penalty += 1

no_itis_entry = []

for s in VKB.species:
    print(s.name)
    # Find synonyms in NCBI Taxonomy
    taxid = s.out_links['ncbi_taxonomy']['id']
    ncbi_payload = {
        'db': 'taxonomy',
        'id': taxid
    }
    print('    NCBI api call')
    r = requests.get(NCBI_BASE + 'efetch.fcgi', params=ncbi_payload)
    
    names = find_species_names(r.text)
    
    tsn = None
    for n in names:
        # Need to construct the request URL the old fashioned way... Idk why.
        n_encoded = n.replace(' ', '%20')
        print('    ITIS api call')
        req_url = ITIS_BASE+'searchByScientificName?srchKey='+n_encoded
        r = requests.get(req_url)
        itis_object = json.loads(r.text)
        # ipdb.set_trace()
        if itis_object['scientificNames'][0] == None:
            continue
        tsn = itis_object['scientificNames'][0]['tsn']
        break
    if tsn == None:
        no_itis_entry.append({
            'name': s.name,
            'taxid': taxid
        })
        print("  Error! Couldn't find a TSN for {0}".format(s.name))
        continue
    
    # Now, do some useful stuff with the TSN

    # Get ancestor taxonomy terms
    req_url = ITIS_BASE+'getFullHierarchyFromTSN?tsn='+tsn
    r = requests.get(req_url)
    hierarchy = json.loads(r.text)['hierarchyList']
    itis_h_list = [{'rankName': x['rankName'], 
                     'taxonName': x['taxonName'], 
                     'itis_tsn': x['tsn']} for x in hierarchy]

    print_formatted_h_list(itis_h_list)

    VKB.mongo_connection.species.update_one(
        {'_id': s._mongo_id},
        {
            '$set': {
                'taxonomic_lineage': itis_h_list
            }
        }
    )

    # print("  {0}: {1}".format(s.name, tsn))
with open('no_itis_entry.txt', 'w') as fp:
    json.dump(no_itis_entry, fp)