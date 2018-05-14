from __future__ import print_function

# DESCRIPTION: Matches failing results from add_taxonomic_data to ITIS data for genus

import sys
import os
import json
import requests
import ipdb
import lxml
import urllib
from pymongo import MongoClient
from collections import OrderedDict

from venomkb_builder import VenomKB

ITIS_BASE = 'https://www.itis.gov/ITISWebService/jsonservice/'
NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'

VKB = VenomKB()
VKB.load_database()

with open("no_itis_entry.txt", 'r') as fp:
    missing_data_list = json.load(fp)

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

def find_venomkb_entry(taxid):
    for s in VKB.species:
        if s.out_links['ncbi_taxonomy']['id'] == taxid:
            return s
    raise KeyError

no_itis_entry = []

for s_nonvkb in missing_data_list[203:]:
    s = find_venomkb_entry(s_nonvkb['taxid'])
    taxid = s.out_links['ncbi_taxonomy']['id']
    ncbi_payload = {
        'db': 'taxonomy',
        'id': taxid
    }
    print('    NCBI api call')
    r = requests.get(NCBI_BASE + 'efetch.fcgi', params=ncbi_payload)
    
    names = find_species_names(r.text)

    # discard species or subspecies names
    names = [n.split(' ')[0] for n in names]
    names = list(OrderedDict.fromkeys(names))  # remove any duplicates while preserving order
    tsn = None
    matching_name = None
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
        
        # Find the result that exactly matches the query
        exact_match = None
        for m in itis_object['scientificNames']:
            if m['combinedName'] == n:
                exact_match = m
                matching_name = n
        if exact_match == None:
            continue

        tsn = exact_match['tsn']
        break
    if tsn == None:
        no_itis_entry.append({
            'name': s.name,
            'taxid': taxid
        })
        print("  Error! STILL couldn't find a TSN for {0}".format(s.name))
        continue
    req_url = ITIS_BASE+'getFullHierarchyFromTSN?tsn='+tsn
    r = requests.get(req_url)
    hierarchy = json.loads(r.text)['hierarchyList']
    # prune children
    new_hierarchy = []
    for h in hierarchy:
        new_hierarchy.append(h)
        if h['taxonName'].lower() == matching_name.lower():
            break
    itis_h_list = [{'rankName': x['rankName'], 
                     'taxonName': x['taxonName'], 
                     'itis_tsn': x['tsn']} for x in new_hierarchy]
    finalRankName = None
    if itis_h_list[-1]['rankName'] == 'Genus':
        finalRankName = 'Species'
    elif itis_h_list[-1]['rankName'] == 'Species':
        finalRankName = 'Subspecies'
    elif itis_h_list[-1]['rankName'].lower() == 'subspecies':
        finalRankName = 'Subsubspecies'
    itis_h_list.append({
        'rankName': finalRankName,
        'taxonName': s.name,
        'itis_tsn': 'None'
    })
    print_formatted_h_list(itis_h_list)

    VKB.mongo_connection.species.update_one(
        {'_id': s._mongo_id},
        {
            '$set': {
                'taxonomic_lineage': itis_h_list
            }
        }
    )

with open('still_no_itis_entry2.txt', 'w') as fp:
    json.dump(no_itis_entry, fp)