import json
import ipdb
import bson
from tqdm import tqdm
from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()

with open("image_url_index.json", 'r') as fp:
    img_url_idx = json.load(fp)

for i in tqdm(img_url_idx):
    VKB.mongo_connection.proteins.update_one(
        {'_id': bson.objectid.ObjectId(i[0])},
        {
            '$set': {
                'pdb_image_url': i[2],
                'pdb_structure_known': i[1]
            }
        }
    )