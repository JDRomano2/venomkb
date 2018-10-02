from __future__ import print_function
import os, sys
import json
import xmltodict
import requests
import ipdb
from tqdm import tqdm

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

refs_out = {}
for x in tqdm(VKB.proteins):
    toxprot = VKB.get_record_from_toxprot(x.venomkb_id, 'reference')
    refs = [y['reference']['citation'] for y in toxprot]
    refs_formatted = []
    for r in refs:
        if r['@type'] == 'journal article':
            pmid = None
            doi = None

            if 'dbReference' in r.keys():
                try:
                    pmid = [j['@id'] for j in r['dbReference'] if j['@type'] == 'PubMed'][0]
                    doi = [k['@id'] for k in r['dbReference'] if k['@type'] == 'DOI'][0]
                except TypeError:
                    # There's only one dbref, so just use that.
                    
                    if r['dbReference']['@type'] == 'PubMed':
                        pmid = r['dbReference']['@id']
                    elif r['dbReference']['@type'] == 'DOI':
                        doi = r['dbReference']['@id']
                    else:
                        print("Uh oh! Can't parse the database reference.")
                        ipdb.set_trace()
            try:
                refs_formatted.append({
                    'date': r['@date'],
                    'journal_name': r['@name'],
                    'title': r['title'],
                    'first_author': r['authorList']['person'][0]['@name'],
                    'pmid': pmid,
                    'doi': doi
                })
            except KeyError:
                # Only one author
                try:
                    refs_formatted.append({
                        'date': r['@date'],
                        'journal_name': r['@name'],
                        'title': r['title'],
                        'first_author': r['authorList']['person']['@name'],
                        'pmid': pmid,
                        'doi': doi
                    })
                except KeyError:
                    # screw it... this reference is garbage.
                    continue
    refs_out[x.venomkb_id] = refs_formatted

for k, v in refs_out.iteritems():
    VKB.add_to_existing(vkbid=k, new_key='literature_reference', new_value=v, replace_if_exist=True)