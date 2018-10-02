from __future__ import print_function
import requests
from lxml import etree
import pdb

UNIPROT_BASE_URL = "http://uniprot.org/uniprot"

def getUniprotXML(uniprot_id):
    """Using the requests module, obtain a connection
    to the Uniprot API"""
    uniprot_url = UNIPROT_BASE_URL + '/' + uniprot_id + '.xml'
    utf8_parser = etree.XMLParser(encoding='utf-8')
    r = requests.get(uniprot_url)
    node = etree.fromstring(r.text.encode('utf-8'), parser=utf8_parser)
    return node

def getTxidFromUniprotId(uniprot_id):
    """Self explanatory..."""
    species_xml_etree = getUniprotXML(uniprot_id)
    species_element = species_xml_etree[0].findall('{'+UNIPROT_BASE_URL+'}organism')
    assert len(species_element) <= 1
    if len(species_element) == 0:
        return None
    if len(species_element) == 1:
        spec_refs = species_element[0].findall('{'+UNIPROT_BASE_URL+'}dbReference')[0]
        txids = [spec_refs.values()[i] for i, k in enumerate(spec_refs.keys()) if k == 'id']
        assert len(txids) == 1
        return txids[0]