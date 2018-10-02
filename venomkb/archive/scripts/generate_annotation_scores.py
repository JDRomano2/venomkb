from __future__ import print_function, division

import os, sys
import json
import ipdb
from tqdm import tqdm
import numpy as np
from scipy import stats

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

def convert_to_uniform(in_data):
    """Reshape an arbitrary empirical distribution to 
    a uniform distribution with range (0,1).

    Keyword arguments:
    in_data -- list of floating point values, unbounded.

    Returns:
    in_data, reshaped and scaled to an empirical normal distribution."""
    out_data = in_data
    sorted_inds = in_data.argsort()
    for x in xrange(sorted_inds.shape[0]):
        out_data[sorted_inds[x]] = float(x) / in_data.shape[0]
    return out_data

def rescale_uniform(in_data, a, b):
    """Scale and shift a single uniform RV from (0,1) to (a, b).

    Keyword arguments:
    in_data -- Unscaled floating point in the range [0, 1]
    a -- Lower bound on the scaled uniform random variable.
    b -- Upper bound on the scaled uniform random variable.

    Returns:
    Floating point in the range [a, b]."""
    mult_factor = float(b) - float(a)
    return (in_data * mult_factor) + float(a)

def score_protein(p):
    """Score a protein.

    Keyword arguments:
    p -- The protein, as an encoded JSON document.

    
    Returns:
    Floating point value >= -4.0"""
    score = 0.
    if 'pdb_structure_known' in p.keys():
        if p['pdb_structure_known'] == True:
            score += 3
    if 'pdb_image_url' in p.keys():
        if p['pdb_image_url'] != "":
            score += 1.
        if 'None' in p['pdb_image_url']:
            score -= 4
    if 'description' in p.keys():
        score += 1.
    score += (len(p['out_links']) * 0.1)
    if 'literature_predications' in p.keys():
        score += 0.2
        score += (len(p['literature_predications']) * 0.05)
    return score

def score_species(s):
    """Score a species.

    Keyword arguments:
    s -- The species, as an encoded JSON document.

    Returns:
    Floating point value >= 0"""
    score = 0.
    if 'species_image_url' in s.keys():
        if s['species_image_url'] != "":
            score += 1.
    score += (len(s['venom']['proteins']) * 0.05)
    if 'taxonomic_lineage' in s.keys():
        score += 3.2
    return score

"""
# Proteins
p_scores = []
for p in tqdm(VKB.proteins):
    m_p = VKB.mongo_connection.proteins.find_one({"_id": p._mongo_id})
    
    score = score_protein(m_p)
    
    p_scores.append(score)

p_scores = convert_to_uniform(np.array(p_scores))
p_scores = rescale_uniform(p_scores, 1, 5)
"""

# Species
s_scores = []
for s in tqdm(VKB.species):
    m_s = VKB.mongo_connection.species.find_one({"_id": s._mongo_id})
    score = score_species(m_s)
    s_scores.append(score)

s_scores = convert_to_uniform(np.array(s_scores))
s_scores = rescale_uniform(s_scores, 1, 5)

#p_scores = [int(round(p)) for p in p_scores]
s_scores = [int(round(s)) for s in s_scores]

s_ids = [s.venomkb_id for s in VKB.species]
#p_ids = [p.venomkb_id for p in VKB.proteins]

#prots = zip(p_ids, p_scores)
specs = zip(s_ids, s_scores)

# add to mongo
"""
for vkbid, score in prots:
    VKB.add_to_existing(vkbid=vkbid, new_key='annotation_score', new_value=score, replace_if_exist=True)
"""

for vkbid, score in specs:
    VKB.add_to_existing(vkbid=vkbid, new_key='annotation_score', new_value=score, replace_if_exist=True)
