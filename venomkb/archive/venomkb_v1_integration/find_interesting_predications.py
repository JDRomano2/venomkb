import pandas as pd

df = pd.DataFrame.from_csv('./smdb_search_toxprot_pmid_overlap.tsv', sep='\t', header=0)

SUBSTANCE_CODES = [
    'bdsu',
    'chem',
    'chvs',
    'orch',
    'nnon',
    'aapp',
    'chvf',
    'phsu',
    'bodm',
    'bacs',
    'horm',
    'enzy',
    'vita',
    'imft',
    'irda',
    'hops',
    'sbst',
    'food',
    'rcpt',
    'antb',
    'elii',
    'inch'
]

ANIMAL_CODES = [
    'anim',
    'vtbt',
    'amph',
    'bird',
    'fish',
    'rept',
    'mamm',
    'humn'
]

animal_subject = df[df['s_type'].isin(ANIMAL_CODES)]
animal_object = df[df['o_type'].isin(ANIMAL_CODES)]
substance_subject = df[df['s_type'].isin(SUBSTANCE_CODES)]
substance_object = df[df['o_type'].isin(SUBSTANCE_CODES)]

def filter_by_rules(input_df):
    odf = input_df

    # filter; one line per rule
    odf = odf[(odf['predicate'] != 'PART_OF') & (odf['o_type'] != 'mamm')]
    odf = odf[(odf['s_name'] != 'Toxin') & (odf['o_name'] != 'Venoms')]
    odf = odf[(odf['s_name'] != 'Venoms') & (odf['o_name'] != 'Toxin')]

    return odf

as_filtered_df = filter_by_rules(animal_subject)
ao_filtered_df = filter_by_rules(animal_object)
ss_filtered_df = filter_by_rules(substance_subject)
so_filtered_df = filter_by_rules(substance_object)
