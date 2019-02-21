from __future__ import print_function
from tqdm import tqdm

with open('toxprot_assoc_pmids_flat.tsv', 'w') as fp_out:
    with open('toxprot_assoc_pmids.tsv', 'r') as fp_in:
        fp_in.readline()
        for line in tqdm(fp_in.readlines()):
            x = line.split('\t')
            uniprot = x[0]
            comp_pmids = x[1].split('; ')
            pmids = x[2].strip().split('; ')
            all_pmids = comp_pmids + pmids
            all_pmids = [x for x in all_pmids if x != '']
            for p in all_pmids:
                fp_out.write("{0}\t{1}\n".format(uniprot, p))