from __future__ import print_function
import ipdb
import re
import json
from pprint import pprint
from lxml import etree
import requests
from pymongo import MongoClient
from tqdm import tqdm
from dbinit_helpers import *

UNIPROT_BASE = 'http://www.uniprot.org/uniprot/'
TOXPROT_PATH = (UNIPROT_BASE +
                '?query=annotation%3A%28type%3A"tissue+specificity"+venom%29&sort=score')

CLIENT = MongoClient('mongodb://54.198.136.17:27017')
DATABASE = CLIENT['venomkb-staging']


# Iterate over proteins; add information
for i in xrange(DATABASE.proteins.count()):
    current = DATABASE.proteins.find()[i]
    print(getTxidFromUniprotId(current['out_links']['UniProtKB']))