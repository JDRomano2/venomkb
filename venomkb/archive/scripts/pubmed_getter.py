from __future__ import print_function

import requests
import os, sys
import subprocess
import json
import ipdb

from Bio import Entrez
from Bio import Medline

class PubmedGetter(object):
    def __init__(self, pmid):
        self.authors = []
        self.title = ""
        self.journal = ""
        self.pmid = pmid
        self.citation = ""
        self.medline = None
        self.date_pub = None
    
    def search_by_pmid(self):
        self.title
        text = subprocess.check_output(
            "efetch -db pubmed -id {0} -format MEDLINE".format(self.pmid),
            shell=True
        )
        self.parse_medline(text)

    def parse_medline(self, text):
        self.medline = Medline.read(text.split('\n'))
        self.title = self.medline['TI']
        self.journal = self.medline['JT']
        self.citation = self.medline['SO']
        self.date_pub = self.medline['DP']
        try:
            self.authors = self.medline['AU']
        except KeyError:
            self.authors = self.medline['IR']

    def dump_json(self):
        return {
            "pmid": self.pmid,
            "title": self.title,
            "authors": self.authors,
            "journal": self.journal,
            "citation": self.citation
        }

def run_pubmed_getter(pmid):
    p = PubmedGetter(pmid)
    p.search_by_pmid()
    return p.dump_json()

data = None
if __name__=="__main__":
    with open('../assets/data/genomes.json', 'r') as fp:
        data = json.load(fp)
    for d in data:
        d['literature_reference'] = run_pubmed_getter(d['literature_reference']['pmid'])