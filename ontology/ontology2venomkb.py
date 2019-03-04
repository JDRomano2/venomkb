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

onto = get_ontology("./venom_ontology_2.1.0-alpha.owl")
onto.load()

CLASSES = list(onto.classes())
INDIVIDUALS = list(onto.individuals())
# TODO: these should be determined dynamically - it breaks when class hierarchy is changed
PROTEIN_CLASS = CLASSES[6]
SPECIES_CLASS = CLASSES[7]

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

print("Loading UniProtKB accession--> name map.")
# look for file locally
# MAP_PATH = Path("./data/up_acc2name.pkl")
# if MAP_PATH.is_file():
#   print("Map already cached locally - loading file.")
#   with open("./data/up_acc2name.pkl", 'rb') as fp1:
#     acc2name = pickle.load(fp1)
# else:
#   print("File not found - rebuilding from UniProtKB API.")
#   print("  (this may take a while!)")
#   acc2name = {}
#   for v_p in tqdm(VKB_PROTS):
#     acc = v_p['out_links']['UniProtKB']['id']
#     acc2name[acc] = map_upacc_to_upname(acc)
#   with open("./data/up_acc2name.pkl", 'wb') as fp2:
#     pickle.dump(acc2name, fp2)
acc2name = {}
toxprot_meta = pd.read_csv("./data/toxprot_metadata.tsv", sep="\t")
for index, row in toxprot_meta.iterrows():
  curr = list(row)
  acc2name[curr[0]] = curr[1]

# Start with Proteins as the fundamental datatype
print("Building \"Protein\" and \"Species\" objects")
all_proteins = []
for i in INDIVIDUALS:
  if i.is_a[0] == PROTEIN_CLASS:
    all_proteins.append(i)

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


# Link current venomkb data to ontology output
print("Merging existing ontology contents into data structures")
for v_p in VKB_PROTS:
  p_name = acc2name[v_p['out_links']['UniProtKB']['id']]
  p_equiv = proteins_composed[p_name]
  p_equiv['vkb_legacy'] = v_p

# TODO: add taxonomy to species

# TODO: add publications to proteins, copy to species as well
# TODO: add predications to proteins, copy to species as well

# TODO: Add GO annotations

# TODO: Fetch other external IDs and compose URLs

# TODO: Dump data to JSON and write to disk