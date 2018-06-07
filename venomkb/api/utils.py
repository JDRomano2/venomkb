import json
import requests



VENOMKB_API = "http://venomkb.org/api/"

class VenomkbData(object):
  def __init__(self):
    print("Fetching data from VenomKB's REST API.")
    self.proteins = VenomkbData.fetch_proteins()
    self.species = VenomkbData.fetch_species()
    self.genomes = VenomkbData.fetch_genomes()

  @staticmethod
  def fetch_proteins():
    r = requests.get(VENOMKB_API + 'proteins')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

  @staticmethod
  def fetch_species():
    r = requests.get(VENOMKB_API + 'species')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

  @staticmethod
  def fetch_genomes():
    r = requests.get(VENOMKB_API + 'genomes')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

def PrintOutLinks():
  data = VenomkbData()

  out_species = {}
  for species in data.species:
    if 'out_links' in species:
      for key in species["out_links"]:
        if key in out_species:
          out_species[key] +=1
        else:
          out_species[key] =1
  print("out_links in species")
  for el in out_species:
    print (el, out_species[el])

  out_protein = {}
  for protein in data.proteins:
    if 'out_links' in protein:
      for key in protein["out_links"]:
        if key in out_protein:
          out_protein[key] +=1
        else:
          out_protein[key] =1
  print("out_links in protein")
  for el in out_protein:
    print (el, out_protein[el])

def PrintSpecificOutLink(name):
  data = VenomkbData()
  for protein in data.proteins:
    if 'out_links' in protein:
      if name in protein["out_links"]:
        print(protein["out_links"][name], protein["venomkb_id"])


PrintSpecificOutLink("CAZy")