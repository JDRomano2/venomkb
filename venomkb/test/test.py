#!/usr/bin/env python
"""Standalone script for exporting the contents of VenomKB to Neo4j.

Eventually this script will be merged into a more comprehensive module
structure for VenomKB-related Python code.
"""

from __future__ import print_function, absolute_import

import unittest
import configparser
import sys, os
sys.path.insert(0, os.path.abspath(".."))
import api

ENVIRONMENT = 'DEV'

config = configparser.ConfigParser()
config.read('./venomkb-neo4j.cfg')

HOSTNAME = config[ENVIRONMENT]['Hostname']
USER = config[ENVIRONMENT]['User']
PASSWORD = config[ENVIRONMENT]['Password']
PORT = config['DEFAULT']['Port']
URI = "bolt://{0}:{1}".format(HOSTNAME, PORT)




class TestNeoMethods(unittest.TestCase):

    def test_number_of_data(self):
      # test fetches data
      data = db.VenomkbData()
      categories = ["Peptide", "Carbohydrate", "Biological_Macromolecule", "Inorganic_Molecule", "Whole_Venom_Extract",
                    "Mixture", "Molecule", "Synthetic_Venom_Derivative", "Venomous_Organism", "Chemical_Compound", "Venom", "Thing"]

      self.assertEqual(len(data.species), 632)
      self.assertEqual(len(data.proteins), 6236)

      # test number of nodes
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_count_nodes()
      print(nb)
      self.assertEqual(nb["species"], len(data.species))
      self.assertEqual(nb["proteins"], len(data.proteins))
      self.assertEqual(nb["categories"], len(categories))
      self.assertEqual(nb["genomes"], len(data.genomes))

      nb_predication = 0
      for protein in data.proteins:
        if 'literature_predications' in protein:
          nb_predication += len(protein["literature_predications"])
      self.assertEqual(nb["predications"], nb_predication)

      nb_gene_ontology = 0
      for protein in data.proteins:
        if 'go_annotations' in protein:
          nb_gene_ontology += len(protein["go_annotations"])
      self.assertEqual(nb["gene ontology"], nb_gene_ontology)

    def test_relationship_IS_INSTANCE_OF(self):
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_is_instance_relation()
      self.assertEqual(nb[0], nb[2])
      self.assertEqual(nb[1], nb[3])

    def test_relationship_has_a_pl(self):
      # check that the number of predication is equal to the nb of has_a_pl relation
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      nb = neo.print_has_a_pl_relation()
      self.assertEqual(nb[0], nb[1])

    def test_properties_protein(self):
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      # Protein example : Phospholipase A1 "P6421031"
      properties = neo.print_information_protein("P6421031")
      self.assertEqual(properties["name"], "Phospholipase A1")
      self.assertEqual(properties["score"], 5)
      self.assertEqual(properties["venomkb_id"], "P51528")
      self.assertEqual(properties["aa_sequence"], "GPKCPFNSDTVSIIIETRENRNRDLYTLQTLQNHPEFKKKTITRPVVFITHGFTSSASEKNFINLAKALVDKDNYMVISIDWQTAACTNEYPGLKYAYYPTAASNTRLVGQYIATITQKLVKDYKISMANIRLIGHSLGAHVSGFAGKRVQELKLGKYSEIIGLDPARPSFDSNHCSERLCETDAEYVQIIHTSNYLGTEKILGTVDFYMNNGKNNPGCGRFFSEVCSHTRAVIYMAECIKHECCLIGIPRSKSSQPISRCTKQECVCVGLNAKKYPSRGSFYVPVESTAPFCNNKGKII")
      self.assertEqual(properties["nb_has_venom_component"], 1)
      self.assertEqual(properties["nb_is_instance_of"], 1)
      self.assertEqual(properties["species_name"], "Vespula maculifrons")
      self.assertEqual(properties["ontology_class"], "Peptide")

      # Protein example : Coagulation factor X-activating enzyme heavy chain "P3214280"
      properties = neo.print_information_protein("P3214280")
      self.assertEqual(
          properties["name"], "Coagulation factor X-activating enzyme heavy chain")
      self.assertEqual(properties["score"], 3)
      self.assertEqual(properties["venomkb_id"], "P86536")
      self.assertEqual(properties["aa_sequence"], "VATSEQFNKTFIELVIVVD")
      self.assertEqual(properties["nb_has_venom_component"], 1)
      self.assertEqual(properties["nb_is_instance_of"], 1)
      self.assertEqual(properties["species_name"], "Daboia russelii")
      self.assertEqual(properties["ontology_class"], "Peptide")

      # Protein example : Short neurotoxin 2, "P9908634"
      properties = neo.print_information_protein("P9908634")
      self.assertEqual(properties["name"], "Short neurotoxin 2")
      self.assertEqual(properties["score"], 3)
      self.assertEqual(properties["venomkb_id"], "Q9W7K1")
      self.assertEqual(
          properties["aa_sequence"], "MKTLLLTLVMVTIMCLDLGYTLTCYKGYHDTVVCKPHETICYRYLIPATHGNAIPARGCGTSCPGGNHPVCCSTDLCNK")
      self.assertEqual(properties["nb_has_venom_component"], 1)
      self.assertEqual(properties["nb_is_instance_of"], 1)
      self.assertEqual(properties["species_name"], "Pseudonaja textilis")
      self.assertEqual(properties["ontology_class"], "Peptide")

      # Protein example : Venom factor, "P9611075"
      properties = neo.print_information_protein("P9611075")
      self.assertEqual(properties["name"], "Venom factor")
      self.assertEqual(properties["score"], 4)
      self.assertEqual(properties["venomkb_id"], "J3S836")
      self.assertEqual(properties["aa_sequence"], "MEGMALYLVAALLIGFPASSFGALYTFITPGVLRTDTEEKILVEAHGDNAPKQLDISVHDFPRKQKILYQTRVDMNPAGGMLVTPTITIPAKDLNKDSRQNQYVVVQVTAPGLRLEKVVLLSYQSGFVFIQTDKGIYTPGSPVRYRVFSMDHNMHRMDKTVIVEFQTPQGIVVSSNPVNPASSLIRPYNLPELVSFGTWKAVAKYENSPEESYTALFDVREYVLPGFEVRVQPSEKFLYIDGNTDFHVSITARYLYGKRVEGVAFVLFGVKIDGNKKSIPESLTRIPIIDGDGEATLERHTLSRRFQRLNDLVGHNLYVSVTVITDSGSDMVVTEQSGIHIVTSPYQISFTKTPKYFKPGMPYELMVYVTNPDGSPAANVPVVSESIHSKGTTLSDGTAKLILNTPLNIQSLSITVKTNHRDLPRERQAMKSMTATAYQTQGGSGNYLHIAITSTEIKPGDNLPVSFNVRGNANSLNQIQYFTYLILTKGKIFKVGRQPRGAGQNLVTMTLPITPDLIPSFRFLAYYQVGNSEIVADSVWVDVKDTCMGTLVVKGASSRDNRIQKPGAAMKIKLEGDPGARVGLVAVDKAVYVLSDEYKISQTKIWDTIEKSDFGCTAGSGQNNLGVFEDAGLALATSTSLNTKQRSDAKCPQPENRRRRRSVVLLDSKASKAAQFPDQALRKCCEDGMHENPMGYSCEKREKYIQEGDACKAAFLECCRYIKGIHDENKREDELFLARSDFEDEFFGEDNIISRSDFPESWLWLTENLNAVPNNEGISSKTVPFYLRDSITTWEVLAVSITPTKGICVAEPYEITVMKDFFIDLRLPYSVVKNEQVEVRAILYNYVDDDIDVRVELLHNPAFCSVATETQRYRTQVTIKALSSWAVPFVIVPLQQGLHDIEVRASVRGQLASDGVKKKLKVVPEGMRKDIVTVIELDPSTKGVGGTQEQLVKANELDGKVPDTEIETKISVQGDRVAQIVENSIDGNKLSHLIITPSGCGEQNMITMTPSVIATYYLDTTGQWETLGVDRRTEAVQQIKKGYAQQLVYKKADHSYAAFVNRDSSSWLTAYVVKVFAMATKVVPDISHEIICGGVKWLILNRQQPDGVFKENAPVIHGEMLGGTKGAEPEVSLTAFILIALLESRSICNEHINILESSINKAADYLLKKYEKLQRPYTTALTAYALAAAGLLNDDRVLMAASTERNRWEEHNAYTYNIEGTSYALLALLKMEKFAEANPVVRWLTDQKYYGGTYGQTQATVVGFQGLAEYEIAMPSHKDLNLDIVIKLPEREVPISYRIDATNALRAQTTETKLNEDFTVSASGDGKATMTILTVYNAQLREDANVCNQFHLEVSVERIDSNLKQAKGAKETLKLKICTRYLGEVDSTMTIIDVSMLTGFLPDAEDLTRLSKGVDRYISKFEIDNNMAQKGAVIIYLDKVSHSEDECLQFRIQKHFEVGFIQPGSVKVYSYYNLDEQCTRFYHPDKGTGLLNKICHGNVCRCAEETCSLLNQQKKIDLQLRIQKACEPNVDYVYKAKLLRIEEKDASDIYVMDVLEVIKGGTDRNPQAKPRQYVSQRKCQEALNLKVNNDYLIWGLSSDLWHKKDEISYLITRNTWIERWPNEDECQDEEFQNLCNDFTQLSNTLTIFGCPN")
      self.assertEqual(properties["nb_has_venom_component"], 1)
      self.assertEqual(properties["nb_is_instance_of"], 1)
      self.assertEqual(properties["species_name"], "Crotalus adamanteus")
      self.assertEqual(properties["ontology_class"], "Peptide")

    def test_pfam(self):
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      res = neo.print_pfam("P6421031")
      self.assertEqual(res[0], "Lipase")
      res = neo.print_pfam("P3214280")
      self.assertEqual(res, None)
      res = neo.print_pfam("P9908634")
      self.assertEqual(res, None)

    def test_genome(self):
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      res = neo.print_genome("Lachesana tarabaevi")
      self.assertEqual(res, None)
      res = neo.print_genome("Pseudechis australis")
      self.assertEqual(res, None)
      res = neo.print_genome("Mesobuthus martensii")
      self.assertEqual(res[0], "Mesobuthus martensii complete genome")
      res = neo.print_genome("Conus bullatus")
      self.assertEqual(res[0], "Conus bullatus complete genome")
      res = neo.print_genome("Ophiophagus hannah")
      self.assertEqual(res[0], "Ophiophagus hannah complete genome")

    def test_properties_species(self):
      # Species example Lachesana tarabaevi
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      properties = neo.print_information_species("Lachesana tarabaevi")
      self.assertEqual(properties["name"], "Lachesana tarabaevi")
      self.assertEqual(properties["venomkb_id"], "S3801143")
      self.assertEqual(properties["score"], 5)
      self.assertEqual(properties["nb_has_venom_component"], 38)
      self.assertEqual(properties["nb_is_instance_of"], 1)

      # Species example Lachesana tarabaevi
      properties = neo.print_information_species("Conus striatus")
      self.assertEqual(properties["name"], "Conus striatus")
      self.assertEqual(properties["venomkb_id"], "S2192124")
      self.assertEqual(properties["score"], 5)
      self.assertEqual(properties["nb_has_venom_component"], 37)
      self.assertEqual(properties["nb_is_instance_of"], 1)

      # Species example Trimeresurus puniceus
      properties = neo.print_information_species('Trimeresurus puniceus')
      self.assertEqual(properties["name"], 'Trimeresurus puniceus')
      self.assertEqual(properties["venomkb_id"], "S1850863")
      self.assertEqual(properties["score"], 4)
      self.assertEqual(properties["nb_has_venom_component"], 6)
      self.assertEqual(properties["nb_is_instance_of"], 1)

      # Species example Naja atra
      properties = neo.print_information_species("Naja atra")
      self.assertEqual(properties["name"], "Naja atra")
      self.assertEqual(properties["venomkb_id"], "S6067040")
      self.assertEqual(properties["score"], 5)
      self.assertEqual(properties["nb_has_venom_component"], 62)
      self.assertEqual(properties["nb_is_instance_of"], 1)


if __name__ == '__main__':
  unittest.main()

