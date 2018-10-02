from __future__ import print_function

import os
import sys
import json
import requests
import ipdb
from tqdm import tqdm
import urllib

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

# E.g., Bothrops atrox:
# https://www.wikidata.org/w/api.php?action=wbsearchentities&search=Bothrops%20atrox&language=en&format=json
# gets Q900848 as the ID
# https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=Q900848&property=P18&format=json
# gets images (P18) linked to Q900848. The value is "Common lancehead.jpg", and the datatype is "commonsMedia".
# So, build a wikimedia commons url with this filename:
# https://commons.wikimedia.org/wiki/File:Common_lancehead.jpg <-- notice that spaces are replaced with underscores

WIKIDATA_API_BASE = "https://www.wikidata.org/w/api.php?"

WIKIDATA_SEARCH_URL_PREFIX = WIKIDATA_API_BASE + "action=wbsearchentities&search="
WIKIDATA_SEARCH_URL_SUFFIX = "&language=en&format=json"

WIKIDATA_FETCH_IMAGE_URL_PREFIX = WIKIDATA_API_BASE + "action=wbgetclaims&entity="
WIKIDATA_FETCH_IMAGE_URL_SUFFIX = "&property=P18&format=json"

WIKIMEDIA_PREFIX = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&redirects&format=json&iiurlwidth=250&titles=File:"

def image_search(name):
    s_name_formatted = name.replace(" ", "%20")
    s_search_url = WIKIDATA_SEARCH_URL_PREFIX + s_name_formatted + WIKIDATA_SEARCH_URL_SUFFIX
    return requests.get(s_search_url)

def fetch_from_wd_id(wdid):
    s_fetch_url = WIKIDATA_FETCH_IMAGE_URL_PREFIX + wdid + WIKIDATA_FETCH_IMAGE_URL_SUFFIX
    return requests.get(s_fetch_url)

def wikimedia_url_from_fname(fname):
    x = requests.get(WIKIMEDIA_PREFIX + fname)
    response = json.loads(x.text)
    response_pages = response['query']['pages']
    return response_pages[response_pages.keys()[0]]['imageinfo'][0]['url']

species_image_map = []
for s in tqdm(VKB.species):
    # look for a species page
    r = image_search(s.name)
    if len(json.loads(r.text)['search']) == 0:
        if len(s.name.split(" ")) > 2:
            r = image_search(" ".join(s.name)[:2])
        elif len(s.name.split(" ")) == 2:
            r = image_search(s.name.split(" ")[0])
        else:
            print("ERROR: No wikidata ID found for {0}".format(s.name))
            continue
        if len(json.loads(r.text)['search']) == 0:
            print("ERROR: No wikidata ID found for {0}".format(s.name))
            continue
    wikidata_id = json.loads(r.text)['search'][0]['id']
    
    # validate wikidata_id
    if (wikidata_id[0] != 'Q'):
        print("ERROR: No wikidata ID found for {0}".format(s.name))
        continue
    
    # Look for images for the identified wikidata id
    r = fetch_from_wd_id(wikidata_id)
    if r.status_code != 200:
        print("ERROR: No image available for {0}".format(s.name))
        continue
    try:
        filename = json.loads(r.text)['claims']['P18'][0]['mainsnak']['datavalue']['value']
    except KeyError:
        continue
    filename_processed = filename.replace(" ", "_")
    full_image_url = wikimedia_url_from_fname(filename_processed)
    species_image_map.append([
        s._mongo_id,
        s.name,
        full_image_url
    ])

for x in species_image_map:
    extension = x[2].split('.')[-1]
    out_f_name = '../img/species/' + x[1].replace(" ", "_") + '.' + extension
    urllib.urlretrieve(x[2], out_f_name)

# write map to file
with open('species_image_map.pkl', 'wb') as fp:
    pickle.dump(species_image_map, fp)