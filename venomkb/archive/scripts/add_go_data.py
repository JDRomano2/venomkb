import json
from tqdm import tqdm

from venomkb_builder import VenomKB

VKB = VenomKB()
VKB.load_database()


go_annotations_out = {}
for x in tqdm(VKB.proteins):
    try:
        toxprot = VKB.get_record_from_toxprot(x.venomkb_id, 'dbReference', json=False)
    except:
        continue
    go_annotations = [y for y in toxprot if ('type', 'GO') in y.items()]
    this_protein = []
    for go in go_annotations:
        current = {}

        go_id = [z[1] for z in go.items() if z[0] == 'id'][0]

        for prop in go:
            dict_form = dict(prop.items())
            current[dict_form['type']] = dict_form['value']
        current['id'] = go_id

        # append to temporary list of structured go_annotations
        this_protein.append(current)
    # push to global list of go_annotations
    go_annotations_out[x.venomkb_id] = this_protein

'''
for vkbid, annot_list in tqdm(go_annotations_out.iteritems()):
    VKB.add_to_existing(vkbid=vkbid,
                        new_key='go_annotations',
                        new_value=annot_list,
                        replace_if_exist=True)
'''
