from __future__ import print_function
import pickle
import glob
from tqdm import tqdm

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

with open('species_image_map.pkl', 'rb') as fp:
    species_image_map = pickle.load(fp)

good_species_fnames = glob.glob('../img/species/*')
species_fnames = [x.split('/')[-1] for x in good_species_fnames]
species = ['.'.join(x.split('.')[:-1]).replace('_', ' ') for x in species_fnames]

species_map_filtered = [x for x in species_image_map if x[1] in species]

for s in tqdm(species_map_filtered):
    VKB.mongo_connection.species.update_one(
        {'_id': s[0]},
        {
            '$set': {
                'species_image_url': s[2]
            }
        }
    )