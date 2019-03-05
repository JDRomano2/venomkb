#!/usr/bin/env python

from owlready2 import *
import ipdb
import os, sys
import json
import pandas as pd
import pickle
from urllib.request import urlopen
from collections import defaultdict, OrderedDict
from pathlib import Path
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

onto = get_ontology("./venom_ontology_2.1.0-alpha.owl")
onto.load()

CLASSES = list(onto.classes())
INDIVIDUALS = list(onto.individuals())
# TODO: these should be determined dynamically - it breaks when class hierarchy is changed
PROTEIN_CLASS = CLASSES[6]
SPECIES_CLASS = CLASSES[7]
NOMENCLATURE_CHANGES = []

# Set up SPARQL wrapper and template for retrieving old protein names from UniProtKB
SPARQL = SPARQLWrapper("https://sparql.uniprot.org/sparql")
ONM_TEMPLATE = """PREFIX up:<http://purl.uniprot.org/core/>
SELECT ?onm
WHERE {{
    ?protein a up:Protein .
    ?protein up:oldMnemonic ?onm .
    ?protein up:mnemonic '{new_mnemonic}'
}}"""
OLD_MNEMONIC_CACHE_FNAME = "./data/old_mnemonics.pkl"
if os.path.isfile(OLD_MNEMONIC_CACHE_FNAME):
  with open(OLD_MNEMONIC_CACHE_FNAME, 'rb') as fp:
    mnemonic_cache = pickle.load(fp)
else:
  mnemonic_cache = {}

def fetch_old_mnemonics(new_name):
  if new_name in mnemonic_cache.keys():
    return mnemonic_cache[new_name]
  else:
    SPARQL.setQuery(ONM_TEMPLATE.format(new_mnemonic=new_name))
    SPARQL.setReturnFormat(JSON)
    res = SPARQL.query().convert()
    old_mnemonics = []
    for result in res['results']['bindings']:
      old_mnemonics.append(result['onm']['value'])
    mnemonic_cache[new_name] = old_mnemonics
    return old_mnemonics
# E.g., fetch_old_mnemonics("H16A7_CYRHA")


print("Fetching current data from VenomKB API.")
VKB_PROTS = json.load(urlopen("http://venomkb.org/api/proteins"))
VKB_SPECS = json.load(urlopen("http://venomkb.org/api/species"))
VKB_GENOM = json.load(urlopen("http://venomkb.org/api/genomes"))

def species_factory():
  return {'venom_proteins': []}

def map_upacc_to_upname(accession):
  tmp = urlopen("https://www.uniprot.org/uniprot/{0}.tab".format(accession))
  entry_strio = StringIO(tmp.read().decode("utf-8"))
  tab = pd.read_table(entry_strio)
  return(tab['Entry name'][0])

def add_incompatibility(obj, text):
  if 'incompatibility' in obj.keys():
    obj['incompatibility'].append(text)
  else:
    obj['incompatibility'] = [text]

def normalize_species_name(species_name):
  return species_name.lower().replace(" ", "_")


depr = {
  # FORMAT: 'NEW': 'DEPRECATED'
  'CONPO': 'CONVT'
}

def remap_deprecated_name(name):
  tax_part = name.split("_")[-1]
  if tax_part in depr.keys():
    new_name = name.replace(tax_part, depr[tax_part])
    print("REMAPPING: {0} -> {1}".format(name, new_name))
    return new_name
  else:
    return name

print("Loading UniProtKB accession--> name map.")
acc2name = {}
toxprot_meta = pd.read_csv("./data/toxprot_metadata.tsv", sep="\t")
for index, row in toxprot_meta.iterrows():
  curr = list(row)
  # Need to look for deprecated names!
  acc2name[curr[0]] = curr[1]


###########################################
# READ MOST OF THE DATA WE NEED INTO MEMORY
###########################################

# Start with Proteins as the fundamental datatype
print("Building \"Protein\" and \"Species\" objects")
all_proteins = []
for i in INDIVIDUALS:
  if i.is_a[0] == PROTEIN_CLASS:
    all_proteins.append(i)

# First pass: 
# Make bare proteins and species with object annotation links
proteins_composed = {}
species_composed = defaultdict(species_factory)
for p in all_proteins:
  this_protein = {}
  this_protein['onto_object'] = p
  this_protein['sequence'] = p.sequence[0]
  this_protein['name'] = p.label[0]
  this_species = p.hasVenom.speciesOfOrigin
  this_protein['species'] = this_species.name
  species_composed[this_species.name]['venom_proteins'].append(p.name)
  proteins_composed[p.name] = this_protein


# Second pass:
# Read in existing VenomKB data and add to the bare protein and species data structures
print("Merging existing ontology contents into data structures")
print("  ...proteins")
for v_p in tqdm(VKB_PROTS):
  try:
    p_name = acc2name[v_p['out_links']['UniProtKB']['id']]
  except KeyError:
    print("Can't process accession! {0}".format(v_p['out_links']['UniProtKB']['id']))
  p_name_undepr = remap_deprecated_name(p_name)
  try:
    p_equiv = proteins_composed[p_name_undepr]
    p_equiv['vkb_legacy'] = v_p
    if p_name != p_name_undepr:
      add_incompatibility(p_equiv, "UniProt species nomenclature changed: {0} -> {1}".format(p_name, p_name_undepr))
      NOMENCLATURE_CHANGES.append("Protein name changed: {0} -> {1}".format(p_name, p_name_undepr))
  except KeyError:
    #print("Error: {0}".format(p_name_undepr))
    # Check for deprecated names
    old_mnemonics = fetch_old_mnemonics(p_name_undepr)
    for omn in old_mnemonics:
      if omn in proteins_composed.keys():
        p_equiv = proteins_composed[omn]
        p_equiv['vkb_legacy'] = v_p
        add_incompatibility(p_equiv, "Protein mnemonic changed: {0} -> {1}".format(p_name, omn))
        NOMENCLATURE_CHANGES.append("Protein name changed: {0} -> {1}".format(p_name, omn))
print("  ...species")
for v_s in VKB_SPECS:
  v_s_name = v_s['name']
  normalized_name = normalize_species_name(v_s_name)
  s_equiv = species_composed[normalized_name]
  s_equiv['vkb_legacy'] = v_s


########################################################
# NOW, WE CAN PLACE DATA WHERE WE ACTUALLY WANT IT TO GO
########################################################

# START BUILDING THE JSON OBJECT (as a python dict for now)

# PROTEINS FIRST
for pr_n, pr in proteins_composed.items():
  vkbl = pr['vkb_legacy']
  pr['json'] = {

  }


def get_prot_vkbids(prot_name_list):
  vkbids = []
  for pn in prot_name_list:
    vkbids.append(proteins_composed[pn]['vkb_legacy']['venomkb_id'])
  return vkbids

# THEN SPECIES
for sp_n, sp in species_composed.items():
  vkbl = sp['vkb_legacy']
  sp['json'] = {
    'speciesName': sp_n,
    'commonName': vkbl['common_name'],
    'venomkbId': vkbl['venomkb_id'],
    'venomRef': vkbl['venom_ref'],
    'venom': {
      'proteins': get_prot_vkbids(prot_names)
    },

  }

# TODO: Add GO annotations

# TODO: Fetch other external IDs and compose "outLinks"
# (use predefined rules to construct URLs)

# TODO: Dump data to JSON and write files to disk
print("Dumping cache of deprecated names to disk.")
with open(OLD_MNEMONIC_CACHE_FNAME, 'wb') as fp:
  pickle.dump(mnemonic_cache, fp)