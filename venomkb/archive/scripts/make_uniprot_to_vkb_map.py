import json

with open("frozen_data/proteins_0601.json", 'r') as fp:
    proteins = json.load(fp)

pmap = ""
for p in proteins:
    up = p['out_links']['UniProtKB']['db_obj']
    vkb = p['venomkb_id']
    pmap += up
    pmap += ","
    pmap += vkb
    pmap += "\n"

with open("uniprot_to_vkb_map.txt", 'w') as fp:
    fp.write(pmap)