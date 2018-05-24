#!/usr/bin/env python
"""Standalone script for exporting the contents of VenomKB to Neo4j.

Eventually this script will be merged into a more comprehensive module
structure for VenomKB-related Python code.
"""

from __future__ import print_function, absolute_import

import json
import os
import requests
import configparser
from neo4j.v1 import GraphDatabase
import time
import unittest

ENVIRONMENT = 'DEV'

config = configparser.ConfigParser()
config.read('./venomkb-neo4j.cfg')

HOSTNAME = config[ENVIRONMENT]['Hostname']
USER = config[ENVIRONMENT]['User']
PASSWORD = config[ENVIRONMENT]['Password']
PORT = config['DEFAULT']['Port']
URI = "bolt://{0}:{1}".format(HOSTNAME, PORT)

__author__ = "Joseph D. Romano and Marine Saint Mezard"
__copyright__ = "Copyright 2018, The Tatonetti Lab"
__credits__ = ["Joseph D. Romano", "Marine Saint Mezard"]
__license__ = "MIT"
__version__ = "1.0.0-alpha"
__maintainer__ = "Joseph D. Romano"
__email__ = "jdr2160@cumc.columbia.edu"
__status__ = "Development"

VENOMKB_API = "http://venomkb.org/api/"


class VenomkbData(object):
  def __init__(self):
    print("Fetching data from VenomKB's REST API.")
    self.proteins = VenomkbData.fetch_proteins()
    self.species = VenomkbData.fetch_species()

  @staticmethod
  def fetch_proteins():
    r = requests.get(VENOMKB_API + 'proteins')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()

  @staticmethod
  def fetch_species():
    r = requests.get(VENOMKB_API + 'species')
    print(r.status_code)
    print(r.headers['content-type'])
    print(r.encoding)
    return r.json()


class Neo4jWriter(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_species(self, name, venomkb_id, score):
    with self._driver.session() as session:
      species = session.write_transaction(self._add_species, (name, venomkb_id, score))
      print(species)

  def print_protein(self, name, venomkb_id, score, aa_sequence, UnitProtKB_id):
    with self._driver.session() as session:
      protein = session.write_transaction(self._add_protein, (name, venomkb_id, score, aa_sequence, UnitProtKB_id))
      print(protein)

  def print_category_nodes(self, name):
      with self._driver.session() as session:
        category = session.write_transaction(self._add_nodes_category, name)
        print(category)

  def print_pfam_node(self, pfam):
    with self._driver.session() as session:
      pfam = session.write_transaction(self._add_nodes_pfam, pfam)
      print(pfam)

  def print_link(self, species, protein_id):
     with self._driver.session() as session:
      relationship = session.write_transaction(self._add_relationship, (species, protein_id))
      print(relationship)

  def print_protein_peptide_relationship(self, protein_id):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_protein_peptide_relationship, protein_id)
      print(relationship)

  def print_specie_organism_relationship(self, species_id):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_species_organism_relationship, species_id)
      print(relationship)


  def print_is_a_relationship(self, category_a, category_b):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_is_a_relationship, (category_a, category_b))
      print(relationship)

  def print_pfam_relationship(self, protein_id, pfam):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_pfam_relation, (protein_id, pfam))
      print(relationship)

  def print_is_a_go_relation_and_node(self, protein_id, evidence,term, go_id, project):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_is_a_go_relation_and_node, (protein_id, evidence, term, go_id, project))
      print(relationship)

  def print_predication_relation_and_node(self, protein_id,  s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_predication_relation_and_node, (protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid))
      print(relationship)

  def purge(self):
    with self._driver.session() as session:
      del_all = session.write_transaction(self._purge_db_contents)
      return del_all



  @staticmethod
  def _add_species(tx, payload):
    (name, venomkb_id, score) = payload
    result = tx.run("CREATE (a:Species) "
                    "SET a.name = $name "
                    "SET a.vkbid = $venomkb_id "
                    "SET a.score = $score "
                    "RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)", name=name, venomkb_id=venomkb_id, score=score)
    return result.single()[0]

  @staticmethod
  def _add_protein(tx, payload):
    (name, venomkb_id , score, aa_sequence, UnitProtKB_id) = payload
    result = tx.run("CREATE (a:Protein) "
                    "SET a.name = $name "
                    "SET a.vkbid = $venomkb_id "
                    "SET a.annotation_score = $score "
                    "SET a.aa_sequence = $aa_sequence "
                    "SET a.UnitProtKB_id = $UnitProtKB_id "
                    "RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)", name=name, venomkb_id=venomkb_id, score=score, aa_sequence=aa_sequence, UnitProtKB_id=UnitProtKB_id)
    return result.single()[0]

  @staticmethod
  def _add_nodes_category(tx, name):
    result = tx.run("CREATE (a:OntologyClass) "
                    "SET a.name = $name "
                    "RETURN a.name +', from node ' + id(a)", name=name)
    return result.single()[0]

  @staticmethod
  def _add_nodes_pfam(tx, name):
    result = tx.run("CREATE (a:Pfam) "
                    "SET a.name = $name "
                    "RETURN a.name +', from node ' + id(a)", name=name)
    return result.single()[0]


  @staticmethod
  def _add_relationship(tx, payload):
    (species, protein_id) = payload
    statement = """MATCH (a:Species) WHERE a.name = {species}
                MATCH (b:Protein) WHERE b.vkbid = {protein_id}
                CREATE (a)-[r:HAS_VENOM_COMPONENT]->(b)
                RETURN r"""
    result = tx.run(statement, {"species": species, "protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_protein_peptide_relationship(tx, protein_id):
    statement = """MATCH (a:Protein) WHERE a.vkbid = {protein_id}
                MATCH (b:OntologyClass) WHERE b.name = "Peptide"
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_species_organism_relationship(tx, species_id):
    statement = """MATCH (a:Species) WHERE a.vkbid = {species_id}
                MATCH (b:OntologyClass) WHERE b.name = "Venomous_Organism"
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"species_id": species_id})
    return result.single()[0]

  @staticmethod
  def _add_is_a_relationship(tx, categories):
    (category_a, category_b) = categories
    statement = """MATCH (a:OntologyClass) WHERE a.name = {category_a}
                MATCH (b:OntologyClass) WHERE b.name = {category_b}
                CREATE (a)-[r:IS_A]->(b)
                RETURN r"""
    result = tx.run(statement, {"category_a": category_a, "category_b": category_b})
    return result.single()[0]

  @staticmethod
  def _add_pfam_relation(tx, payload):
    (protein_id, pfam) = payload
    statement = """MATCH (a:Protein) WHERE a.vkbid = {protein_id}
                MATCH (b:Pfam) WHERE b.name = {pfam}
                CREATE (a)-[r:IS_A]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id, "pfam": pfam})
    return result.single()[0]

  @staticmethod
  def _add_is_a_go_relation_and_node(tx, payload):
    (protein_id, evidence, term, go_id, project) = payload
    statement = """MATCH (prot:Protein) where prot.vkbid={protein_id}
                CREATE (go:GeneOntology {goid:{go_id}, term:{term}, evidence:{evidence}, project:{project}})
                CREATE((prot)-[:HAS_A_GO]->(go))
                RETURN go"""
    result = tx.run(statement, {"protein_id": protein_id, "go_id": go_id, "term": term, "evidence":evidence, "project":project})
    return result.single()[0]

  @staticmethod
  def _add_predication_relation_and_node(tx, payload):
    (protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid) = payload
    statement = """MATCH (p:Protein) where p.vkbid={protein_id}
                CREATE (lp:Predication {s_name:{s_name}, s_cui:{s_cui}, s_type:{s_type}, o_cui:{o_cui}, o_name:{o_name}, o_type:{o_type}, predicate:{predicate}, pmid:{pmid}})
                CREATE((p)-[:HAS_A_PL]->(lp))
                RETURN lp"""
    result = tx.run(statement, {"protein_id": protein_id, "s_name": s_name, "s_cui": s_cui, "s_type":s_type, "o_name": o_name, "o_cui": o_cui, "o_type":o_type, "predicate":predicate, "pmid":pmid})
    return result.single()[0]

  @staticmethod
  def _purge_db_contents(tx):
    result = tx.run("MATCH (n)"
                    "DETACH DELETE n")
    return result

class NeoSimpleStat(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_count_proteins(self):
      with self._driver.session() as session:
        nb_proteins = session.write_transaction(self._get_proteins_count)
        print("There are ", nb_proteins, " protein nodes.")
        return nb_proteins

  def print_count_species(self):
      with self._driver.session() as session:
        nb_species = session.write_transaction(self._get_species_count)
        print("There are ", nb_species, " species nodes.")
        return nb_species

  def print_count_nodes(self):
    with self._driver.session() as session:
      nb_nodes = session.write_transaction(self._get_count_nodes)
      print("There are ", nb_nodes[0], "proteins")
      print("There are ", nb_nodes[1], "species")
      print("There are ", nb_nodes[2], "categories")
      print("There are ", nb_nodes[3], "predications")
      print("There are ", nb_nodes[4], "gene ontologies")
      print("There are ", nb_nodes[5], "protein families")
      return nb_nodes

  def print_information_species(self, species_name):
    with self._driver.session() as session:
      species = session.write_transaction(self._get_info_species, species_name)
      return species

  def print_information_protein(self, protein_id):
    with self._driver.session() as session:
      protein_info = session.write_transaction(self._get_info_protein, protein_id)
      return protein_info

  def print_pfam(self, protein_id):
    with self._driver.session() as session:
      pfam = session.write_transaction(self._get_pfam, protein_id)
      print(pfam)
      return pfam

  def print_is_instance_relation(self):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._get_is_instance_of)
      return relationship

  def print_has_a_pl_relation(self):
    with self._driver.session() as session:
      relationship = session.write_transaction(self._get_has_a_pl)
      return relationship

  @staticmethod
  def _get_info_species(tx, species_name):
    statement =""" MATCH (p:Species) WHERE p.name={species_name}
                   MATCH (p)-[r:HAS_VENOM_COMPONENT]->(m)
                   MATCH (p)-[:IS_INSTANCE_OF]->(c:OntologyClass)
                   RETURN p.name, p.vkbid, p.score, count( distinct r), count(distinct c)"""
    result = tx.run(statement, {"species_name": species_name})
    return result.single()

  @staticmethod
  def _get_info_protein(tx, protein_id):
    statement ="""MATCH (p:Protein) WHERE p.vkbid={protein_id}
               MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p)
               MATCH (p)-[:IS_INSTANCE_OF]->(c:OntologyClass)
               RETURN p.name , p.annotation_score, p.UnitProtKB_id, p.aa_sequence, count(s),  count(c), s.name,  c.name"""
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()

  @staticmethod
  def _get_pfam(tx, protein_id):
    statement ="""MATCH (p:Protein) WHERE p.vkbid={protein_id}
               MATCH (p)-[:IS_A]->(f:Pfam)
               RETURN f.name """
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()

  @staticmethod
  def _get_proteins_count(tx):
    statement = "MATCH (p:Protein) RETURN count(p)"
    result = tx.run(statement)
    return result.single()[0]

  @staticmethod
  def _get_species_count(tx):
    statement = "MATCH (p:Species) RETURN count(p)"
    result = tx.run(statement)
    return result.single()[0]

  @staticmethod
  def _get_count_nodes(tx):
    statement = """MATCH (p:Protein)
                   MATCH (s:Species)
                   MATCH (c:OntologyClass)
                   MATCH (pre:Predication)
                   MATCH (go:GeneOntology)
                   MATCH (f:Pfam)
                   RETURN count(p), count(s), count(c), count(pre), count(go), count(f)"""
    result = tx.run(statement)
    return result.single()

  @staticmethod
  def _get_is_instance_of(tx):
    statement = """MATCH (p:Protein)
                   MATCH (s:Species)
                   MATCH (p)-[r:IS_INSTANCE_OF]->(m)
                   MATCH (s)-[q:IS_INSTANCE_OF]->(m)
                   RETURN count(p), count(s), count(DISTINCT r), count(DISTINCT q)"""
    result = tx.run(statement)
    return result.single()

  @staticmethod
  def _get_has_a_pl(tx):
    statement = """MATCH (p:Predication)
                   MATCH (m)-[r:HAS_A_PL]->(p)
                   RETURN count(DISTINCT r), count(p)"""
    result = tx.run(statement)
    return result.single()


class TestNeoMethods(unittest.TestCase):

    def test_number_of_data(self):
      # test fetches data
      data = VenomkbData()
      print(data)
      categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]

      self.assertEqual(len(data.species), 632)
      self.assertEqual(len(data.proteins), 6236)

      # test number of nodes
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_count_nodes()
      self.assertEqual(nb[0], len(data.species))
      self.assertEqual(nb[1], len(data.proteins))
      self.assertEqual(nb[2], len(categories))

      nb_predication = 0
      for species in data.species:
        nb_predication += len(species["literature_predications"])
      self.assertEqual(nb[3], nb_predication)

      nb_gene_ontology = 0
      for protein in data.proteins:
        if 'go_annotations' in protein:
          nb_gene_ontology += len(protein["go_annotations"])
      self.assertEqual(nb[4], nb_gene_ontology)


    def test_relationship_IS_INSTANCE_OF(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_is_instance_relation()
      self.assertEqual(nb[0],nb[2])
      self.assertEqual(nb[1], nb[3])

    def test_relationship_has_a_pl(self):
      # check that the number of predication is equal to the nb of has_a_pl relation
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_has_a_pl_relation()
      self.assertEqual(nb[0],nb[1])


    def test_properties_protein(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      # Protein example : Phospholipase A1 "P6421031"
      properties = neo.print_information_protein("P6421031")
      self.assertEqual(properties[0], "Phospholipase A1")
      self.assertEqual(properties[1], 5)
      self.assertEqual(properties[2], "P51528")
      self.assertEqual(properties[3], "GPKCPFNSDTVSIIIETRENRNRDLYTLQTLQNHPEFKKKTITRPVVFITHGFTSSASEKNFINLAKALVDKDNYMVISIDWQTAACTNEYPGLKYAYYPTAASNTRLVGQYIATITQKLVKDYKISMANIRLIGHSLGAHVSGFAGKRVQELKLGKYSEIIGLDPARPSFDSNHCSERLCETDAEYVQIIHTSNYLGTEKILGTVDFYMNNGKNNPGCGRFFSEVCSHTRAVIYMAECIKHECCLIGIPRSKSSQPISRCTKQECVCVGLNAKKYPSRGSFYVPVESTAPFCNNKGKII")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Vespula maculifrons")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Coagulation factor X-activating enzyme heavy chain "P3214280"
      properties = neo.print_information_protein("P3214280")
      self.assertEqual(properties[0], "Coagulation factor X-activating enzyme heavy chain")
      self.assertEqual(properties[1], 3)
      self.assertEqual(properties[2], "P86536")
      self.assertEqual(properties[3], "VATSEQFNKTFIELVIVVD")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Daboia russelii")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Short neurotoxin 2, "P9908634"
      properties = neo.print_information_protein("P9908634")
      self.assertEqual(properties[0], "Short neurotoxin 2")
      self.assertEqual(properties[1], 3)
      self.assertEqual(properties[2], "Q9W7K1")
      self.assertEqual(properties[3], "MKTLLLTLVMVTIMCLDLGYTLTCYKGYHDTVVCKPHETICYRYLIPATHGNAIPARGCGTSCPGGNHPVCCSTDLCNK")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Pseudonaja textilis")
      self.assertEqual(properties[7], "Peptide")

      # Protein example : Venom factor, "P9611075"
      properties = neo.print_information_protein("P9611075")
      self.assertEqual(properties[0], "Venom factor")
      self.assertEqual(properties[1], 4)
      self.assertEqual(properties[2], "J3S836")
      self.assertEqual(properties[3], "MEGMALYLVAALLIGFPASSFGALYTFITPGVLRTDTEEKILVEAHGDNAPKQLDISVHDFPRKQKILYQTRVDMNPAGGMLVTPTITIPAKDLNKDSRQNQYVVVQVTAPGLRLEKVVLLSYQSGFVFIQTDKGIYTPGSPVRYRVFSMDHNMHRMDKTVIVEFQTPQGIVVSSNPVNPASSLIRPYNLPELVSFGTWKAVAKYENSPEESYTALFDVREYVLPGFEVRVQPSEKFLYIDGNTDFHVSITARYLYGKRVEGVAFVLFGVKIDGNKKSIPESLTRIPIIDGDGEATLERHTLSRRFQRLNDLVGHNLYVSVTVITDSGSDMVVTEQSGIHIVTSPYQISFTKTPKYFKPGMPYELMVYVTNPDGSPAANVPVVSESIHSKGTTLSDGTAKLILNTPLNIQSLSITVKTNHRDLPRERQAMKSMTATAYQTQGGSGNYLHIAITSTEIKPGDNLPVSFNVRGNANSLNQIQYFTYLILTKGKIFKVGRQPRGAGQNLVTMTLPITPDLIPSFRFLAYYQVGNSEIVADSVWVDVKDTCMGTLVVKGASSRDNRIQKPGAAMKIKLEGDPGARVGLVAVDKAVYVLSDEYKISQTKIWDTIEKSDFGCTAGSGQNNLGVFEDAGLALATSTSLNTKQRSDAKCPQPENRRRRRSVVLLDSKASKAAQFPDQALRKCCEDGMHENPMGYSCEKREKYIQEGDACKAAFLECCRYIKGIHDENKREDELFLARSDFEDEFFGEDNIISRSDFPESWLWLTENLNAVPNNEGISSKTVPFYLRDSITTWEVLAVSITPTKGICVAEPYEITVMKDFFIDLRLPYSVVKNEQVEVRAILYNYVDDDIDVRVELLHNPAFCSVATETQRYRTQVTIKALSSWAVPFVIVPLQQGLHDIEVRASVRGQLASDGVKKKLKVVPEGMRKDIVTVIELDPSTKGVGGTQEQLVKANELDGKVPDTEIETKISVQGDRVAQIVENSIDGNKLSHLIITPSGCGEQNMITMTPSVIATYYLDTTGQWETLGVDRRTEAVQQIKKGYAQQLVYKKADHSYAAFVNRDSSSWLTAYVVKVFAMATKVVPDISHEIICGGVKWLILNRQQPDGVFKENAPVIHGEMLGGTKGAEPEVSLTAFILIALLESRSICNEHINILESSINKAADYLLKKYEKLQRPYTTALTAYALAAAGLLNDDRVLMAASTERNRWEEHNAYTYNIEGTSYALLALLKMEKFAEANPVVRWLTDQKYYGGTYGQTQATVVGFQGLAEYEIAMPSHKDLNLDIVIKLPEREVPISYRIDATNALRAQTTETKLNEDFTVSASGDGKATMTILTVYNAQLREDANVCNQFHLEVSVERIDSNLKQAKGAKETLKLKICTRYLGEVDSTMTIIDVSMLTGFLPDAEDLTRLSKGVDRYISKFEIDNNMAQKGAVIIYLDKVSHSEDECLQFRIQKHFEVGFIQPGSVKVYSYYNLDEQCTRFYHPDKGTGLLNKICHGNVCRCAEETCSLLNQQKKIDLQLRIQKACEPNVDYVYKAKLLRIEEKDASDIYVMDVLEVIKGGTDRNPQAKPRQYVSQRKCQEALNLKVNNDYLIWGLSSDLWHKKDEISYLITRNTWIERWPNEDECQDEEFQNLCNDFTQLSNTLTIFGCPN")
      self.assertEqual(properties[4], 1)
      self.assertEqual(properties[5], 1)
      self.assertEqual(properties[6], "Crotalus adamanteus")
      self.assertEqual(properties[7], "Peptide")

    def test_pfam(self):
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      res = neo.print_pfam("P6421031")
      self.assertEqual(res[0], "Lipase")
      res = neo.print_pfam("P3214280")
      self.assertEqual(res, None)
      res = neo.print_pfam("P9908634")
      self.assertEqual(res, None)

    def test_properties_species(self):
      # Species example Lachesana tarabaevi
      neo = NeoSimpleStat(URI, USER, PASSWORD)
      properties = neo.print_information_species("Lachesana tarabaevi")
      self.assertEqual(properties[0], "Lachesana tarabaevi")
      self.assertEqual(properties[1], "S3801143")
      self.assertEqual(properties[2], 5)
      self.assertEqual(properties[3], 38)
      self.assertEqual(properties[4], 1)

      # Species example Lachesana tarabaevi
      properties = neo.print_information_species("Conus striatus")
      self.assertEqual(properties[0], "Conus striatus")
      self.assertEqual(properties[1], "S2192124")
      self.assertEqual(properties[2], 5)
      self.assertEqual(properties[3], 37)
      self.assertEqual(properties[4], 1)

if __name__ == '__main__':
  # properties = neo.print_information_protein("P0307338")
  # neo = NeoSimpleStat(URI, USER, PASSWORD)
  # res = neo.print_pfam("P6421031")
  # print(res[0])
  # res = neo.print_pfam("P3214280")
  unittest.main()
  # t1 = time.time()

  # data = VenomkbData()
  # neo = Neo4jWriter(URI, USER, PASSWORD)

  # # neo.purge()

  # pfam_added = []
  # # add proteins
  # for protein in data.proteins:

  #   neo.print_protein(str(protein["name"]), str(protein["venomkb_id"]), protein["annotation_score"], protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])

  #   if 'Pfam' in protein["out_links"]:
  #     pfam = protein["out_links"]["Pfam"]["attributes"]["name"]
  #     if pfam not in pfam_added:
  #       neo.print_pfam_node(pfam)
  #       pfam_added.append(pfam)
  #     neo.print_pfam_relationship(protein["venomkb_id"], pfam)

  #   if 'go_annotations' in protein:
  #     for elt in protein["go_annotations"]:
  #       neo.print_is_a_go_relation_and_node(protein["venomkb_id"], elt["evidence"], elt["term"], elt["id"], elt["project"])

    # if 'literature_predications' in protein:
    #   if type(protein["literature_predications"][0])==list:
    #     for elt in protein["literature_predications"][0]:
    #       neo.print_predication_relation_and_node(protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])
    #   else:
    #     for elt in protein["literature_predications"]:
    #       neo.print_predication_relation_and_node(protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])

  # # add species
  # for species in data.species:
  #   neo.print_species(str(species["name"]), str(species["venomkb_id"]), species["annotation_score"])

  #   if 'literature_predications' in species:
  #     if type(species["literature_predications"][0])==list:
  #       for elt in species["literature_predications"][0]:
  #         neo.print_predication_relation_and_node(species["name"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])
  #     else:
  #       for elt in species["literature_predications"]:
  #         neo.print_predication_relation_and_node(species["name"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])

  # # add link between species and proteins
  # for specie in data.species:
  #   name = str(specie["name"])
  #   for protein_specie in specie["venom"]["proteins"] :
  #     neo.print_link(name, protein_specie)

  # # add category node
  # categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract", "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]
  # for category in categories:
  #   neo.print_category_nodes(category)

  # # connect proteins to peptide
  # for protein in data.proteins:
  #   neo.print_protein_peptide_relationship(str(protein["venomkb_id"]))

  # # connect species to Venomous_Organism
  # for specie in data.species:
  #   neo.print_specie_organism_relationship(str(specie["venomkb_id"]))

  # # add relation is_a

  # neo.print_is_a_relationship("Peptide", "Biological_Macromolecule")
  # neo.print_is_a_relationship("Carbohydrate", "Biological_Macromolecule")
  # neo.print_is_a_relationship("Biological_Macromolecule", "Molecule")
  # neo.print_is_a_relationship("Inorganic_Molecule", "Molecule")
  # neo.print_is_a_relationship("Whole_Venom_Extract", "Mixture")
  # neo.print_is_a_relationship("Molecule", "Chemical_Compound")
  # neo.print_is_a_relationship("Mixture", "Chemical_Compound")
  # neo.print_is_a_relationship("Synthetic_Venom_Derivative", "Chemical_Compound")
  # neo.print_is_a_relationship("Chemical_Compound", "Venom")
  # neo.print_is_a_relationship("Venomous_Organism", "Thing")
  # neo.print_is_a_relationship("Venom", "Thing")

  # t2 = time.time()
  # total = t2 - t1
  # print("It takes ", total, t2, t1)