from __future__ import print_function
import json
import ipdb
import os
import requests
from lxml import etree
from pymongo import MongoClient
from tqdm import tqdm
import dbinit_helpers
import xmltodict

from vkb_collections import *


PASSWORD = os.environ['VENOMKB_STAGING_PW']
ADMIN_USER = 'venomkb-admin'
CLIENT = MongoClient(os.environ['MONGO_ADDR'])
VENOMKB = CLIENT['venomkb-staging']
# TEST_VENOMKB = CLIENT['venomkb-out-test']
VENOMKB.authenticate(ADMIN_USER, PASSWORD)

UNIPROT_BASE = 'http://www.uniprot.org/uniprot/'
TOXPROT_PATH = UNIPROT_BASE +\
               '?query=annotation%3A%28type%3A"tissue+specificity"+venom%29&sort=score'


def vkb_upid_map():
    """Load a premade map from VenomKB IDs to corresponding Toxprot IDs"""
    with open('frozen_data/uniprot_to_vkb_map.txt', 'r') as fp:
        raw_map = fp.readlines()
    list_map = [list(reversed(x.strip().split(','))) for x in raw_map]
    return dict((k, v) for (k, v) in list_map)


class VenomKB(object):
    """Holds all data records for VenomKB and supports searching"""
    def __init__(self):
        self.proteins = []
        self.genomes = []
        self.species = []
        self.molecular_effects = []
        self.systemic_effects = []
        self.mongo_connection = VENOMKB
        self._id_generator = IdGenerator()  # TODO: Store seed with database for reproducability
        self.vkb_to_upid_map = vkb_upid_map()
        self.load_database()

    def find_record_by_venomkb_id(self, vkbid):
        """Find a record given semi-semantic VenomKB identifier"""
        _prefix = vkbid[0]
        if _prefix == 'P':
            return [p for p in self.proteins if p.venomkb_id == vkbid][0]
        elif _prefix == 'S':
            return [s for s in self.species if s.venomkb_id == vkbid][0]
        elif _prefix == 'G':
            return [g for g in self.genomes if v.venomkb_id == vkbid][0]
        raise LookupError('ID not found in VenomKB')

    def add_new_entry(self, objtype=Collection, vkbid=None, name=None,
                      ols=OutLinks(), mongoid=None, **kwargs):
        """Initialize an arbitrary record and add it to the database model"""
        if vkbid == None:
            new_entry = objtype(vkbid=None, name=name, ols=ols, mongoid=mongoid,
                                id_gen=self._id_generator, **kwargs)
        else:
            new_entry = objtype(vkbid=vkbid, name=name, ols=ols, mongoid=mongoid,
                                id_gen=None, **kwargs)
        if objtype == Protein:
            self.proteins.append(new_entry)
        elif objtype == Species:
            self.species.append(new_entry)
        elif objtype == Genome:
            self.genomes.append(new_entry)
        elif objtype == SystemicEffect:
            self.systemic_effects.append(new_entry)
        return new_entry

    def load_database(self):
        """Read mongodb contents into local memory"""
        mongo_collections = {
            'proteins': VENOMKB['proteins'],
            'species': VENOMKB['species'],
            'genomes': VENOMKB['genomes'],
            'systemic_effects': VENOMKB['systemic_effects']
        }
        for k, val in mongo_collections.iteritems():
            cur = val.find()
            if k == 'proteins':
                for prot in cur:
                    _new_p = Protein(aa_sequence=prot.get('aa_sequence'),
                                     vkbid=prot.get('venomkb_id'),
                                     name=prot.get('name'),
                                     mongoid=prot.get('_id'),
                                     ols=prot.get('out_links'))
                    # TODO: `make_outlinks`  <=== still need to write this method
                    self.proteins.append(_new_p)
            elif k == 'species':
                for spec in cur:
                    _new_s = Species(vkbid=spec.get('venomkb_id'),
                                     name=spec.get('name'),
                                     mongoid=spec.get('_id'),
                                     ols=spec.get('out_links'))
                    self.species.append(_new_s)
            elif k == 'genomes':
                for ven in cur:
                    _new_v = Genome(vkbid=ven.get('venomkb_id'),
                                   name=ven.get('name'),
                                   mongoid=ven.get('_id'))
                    self.genomes.append(_new_v)

    def add_to_existing(self, vkbid, new_key, new_value, replace_if_exist=False):
        type_code = vkbid[0]
        mongo_rep = None
        if type_code == 'P':
            mongo_rep = self.mongo_connection.proteins.find_one({'venomkb_id': vkbid})
        if type_code == 'S':
            mongo_rep = self.mongo_connection.species.find_one({'venomkb_id': vkbid})
        if type_code == 'G':
            mongo_rep = self.mongo_connection.genomes.find_one({'venomkb_id': vkbid})
        if type_code == 'E':
            mongo_rep = self.mongo_connection.systemic_effects.find_one({'venomkb_id': vkbid})
        if new_key in mongo_rep.keys() and replace_if_exist == False:
            print("Error: Key already exists--skipping: {0}, {1}, {2}".format(vkbid, new_key, new_value))
            return
        if type_code == 'P':
            self.mongo_connection.proteins.update_one(
                {'_id': mongo_rep['_id']},
                {
                    '$set': {
                        new_key: new_value
                    }
                }
            )
        if type_code == 'S':
            self.mongo_connection.species.update_one(
                {'_id': mongo_rep['_id']},
                {
                    '$set': {
                        new_key: new_value
                    }
                }
            )
        if type_code == 'G':
            self.mongo_connection.genomes.update_one(
                {'_id': mongo_rep['_id']},
                {
                    '$set': {
                        new_key: new_value
                    }
                }
            )
        if type_code == 'E':
            self.mongo_connection.systemic_effects.update_one(
                {'_id': mongo_rep['_id']},
                {
                    '$set': {
                        new_key: new_value
                    }
                }
            )

    def wipe_database_contents(self):
        """Clear contents of every collection in venomkb"""
        if True:  # Safety switch...
            return
        VENOMKB['proteins'].delete_many({})
        VENOMKB['species'].delete_many({})
        VENOMKB['genomes'].delete_many({})
        VENOMKB['systemic_effects'].delete_many({})

    def replace_database(self):
        """Delete mongodb data and write local data to empty database"""
        if True:
            return
        _out_db = VENOMKB
        _proteins_conn = _out_db['proteins']
        _species_conn = _out_db['species']
        _genomes_conn = _out_db['genomes']
        _systemic_effects_conn = _out_db['systemic_effects']

        print("INFO: Removing current database contents")
        _proteins_conn.delete_many({})
        _species_conn.delete_many({})
        _genomes_conn.delete_many({})
        _systemic_effects_conn.delete_many(({}))

        print("INFO: Adding new proteins")
        for _out_p in self.proteins:
            _new_mongo_id = _proteins_conn.insert_one(_out_p.to_json())
            _out_p._mongo_id = _new_mongo_id.inserted_id
        print("INFO: Adding new species")
        for _out_s in self.species:
            _new_mongo_id = _species_conn.insert_one(_out_s.to_json())
            _out_s._mongo_id = _new_mongo_id.inserted_id
        print("INFO: Adding new genomes")
        for _out_g in self.genomes:
            _new_mongo_id = _genomes_conn.insert_one(_out_g.to_json())
            _out_g._mongo_id = _new_mongo_id.inserted_id
        print("INFO: Adding new genomes")
        for _out_se in self.systemic_effects:
            _new_mongo_id = _systemic_effects_conn.insert_one(_out_se.to_json())
            _out_se._mongo_id = _new_mongo_id.inserted_id

    def update_database(self):
        """Update mongodb records that differ from local records"""
        pass

    def find_protein_by_uniprot_acc(self, acc_id):
        """Given a uniprot accession, find the protein within venomkb"""
        matching_proteins = []
        for _p in self.proteins:
            if _p.out_links.links['UniProtKB'].db_obj == acc_id:
                matching_proteins.append(_p.venomkb_id)
        assert len(matching_proteins) == 1
        return matching_proteins[0]

    def get_uniprot_id(self, vkbid):
        return self.vkb_to_upid_map[vkbid]

    def get_record_from_toxprot(self, vkbid, record_tag, json=True):
        tpid = self.get_uniprot_id(vkbid)
        toxprot_request = "http://www.uniprot.org/uniprot/{0}.xml".format(tpid)
        toxprot_xml = requests.get(toxprot_request)
        etree_repr = etree.fromstring(toxprot_xml.content)
        entry = etree_repr[0]
        matches = [x for x in entry if x.tag.split('}')[-1] == record_tag]
        if json:
            matches = [xmltodict.parse(etree.tostring(x)) for x in matches]
        return matches

    """
    def populate_from_toxprot(self):
        # Read all useful data from toxprot into the abstract database model
        toxprot_req = requests.get(TOXPROT_PATH + '&format=list')
        toxprot = toxprot_req.text.split('\n')
        peptides = {}  # PROTEINS INDEXED BY UNIPROT ID
        species = {}  # ORGANISMS INDEXED BY NCBI TAXID
        print("INFO: Parsing contents of ToxProt database")
        for t in tqdm(toxprot[:-1]):
            # If there's an XML error, retry
            for attempt in range(10):
                try:
                    peptides[t] = {'out_links': {'UniProtKB': t}}
                    uniprot_dump = requests.get(UNIPROT_BASE + t + '.xml')
                    dump_tree = etree.fromstring(uniprot_dump.content)
                except XMLSyntaxError:
                    print("  WARN: Error retrieving valid XML for {0}, retrying (attempt {1} of 10".format(t, attempt))
                    continue
                break

            # get data for the protein
            for elem in dump_tree[0]:

                # Parse basic protein information
                if elem.tag == "{http://uniprot.org/uniprot}protein":
                    for sub_elem in elem:
                        # name
                        if sub_elem.tag == "{http://uniprot.org/uniprot}recommendedName":
                            peptides[t]['name'] = sub_elem.find('{http://uniprot.org/uniprot}fullName').text

                # Parse database references
                if elem.tag == "{http://uniprot.org/uniprot}dbReference":
                    db_type = elem.attrib['type']
                    props = {}
                    props['id'] = elem.attrib['id']
                    for prop in elem:
                        props[prop.attrib['type']] = prop.attrib['value']
                        peptides[t]['out_links'][db_type] = props
                    continue

                # Parse sequence data
                if elem.tag == "{http://uniprot.org/uniprot}sequence":
                    peptides[t]['aa_sequence'] = elem.text.lstrip().strip().replace('\n', '')
                    continue

                # Parse species data
                if elem.tag == "{http://uniprot.org/uniprot}organism":
                    spec_data = {'taxid': None,
                                 'scientific': None,
                                 'common': None}
                    for sub_elem in elem:
                        try:
                            if sub_elem.attrib['type'] == "NCBI Taxonomy":
                                spec_data['taxid'] = sub_elem.attrib['id']
                            if sub_elem.attrib['type'] == "scientific":
                                spec_data['scientific'] = sub_elem.text
                            if sub_elem.attrib['type'] == "common":
                                spec_data['common'] = sub_elem.text
                        except KeyError:
                            pass  # Maybe be smarter about this...
                    # Have we already created the species?
                    if spec_data['taxid'] in species:
                        # Add link to this protein
                        species[spec_data['taxid']]['proteins'].append(t)
                    else:
                        # Create species, then add link to this protein
                        species[spec_data['taxid']] = {'scientific_name': spec_data['scientific'],
                                                       'common_name': spec_data['common'],
                                                       'taxid': spec_data['taxid']}
                        species[spec_data['taxid']]['proteins'] = [t]
                    continue



            #except Exception as exc:
            #    ipdb.set_trace()
            #    print("ERROR: Error parsing {0} - skipping".format(t))
            #    exit

        # now, copy data into abstract data model
        for p_key, p_val in peptides.iteritems():
            self.add_new_entry(objtype=Protein, name=p_val['name'],
                               aa_sequence=p_val['aa_sequence'],
                               ols=OutLinks(links_dict=p_val['out_links']))

        for s_key, s_val in species.iteritems():
            taxid_ref = {
                'ncbi_taxonomy': {
                    'db_name': 'NCBI Taxonomy',
                    'db_obj': s_key
                }
            }
            cur_species = self.add_new_entry(objtype=Species, name=s_val['scientific_name'],
                                             common_name=s_val['common_name'],
                                             ols=OutLinks(links_dict=taxid_ref))

            venom_name = s_val['scientific_name'] + ' venom'
            venom_vkbid = 'V' + cur_species.venomkb_id[1:]
            cur_venom = self.add_new_entry(objtype=Venom, name=venom_name, vkbid=venom_vkbid,
                                           species_ref=cur_species.venomkb_id,
                                           prot_list=s_val['proteins'])
            cur_species.venom_ref = cur_venom.venomkb_id

            # Link this species to all of its proteins
            for a_uniprot_acc in cur_venom.proteins:
                # first, find the protein's VenomKB ID by its UniProt accession
                p_vkbid = self.find_protein_by_uniprot_acc(a_uniprot_acc)
                p_record = self.find_record_by_venomkb_id(p_vkbid)
                p_record.venom_ref = cur_venom.venomkb_id
    """

if __name__ == "__main__":
    db = VenomKB()
    db.populate_from_toxprot()
    db.replace_database()
