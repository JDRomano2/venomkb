#!/usr/bin/env python
"""Standalone script for exporting the contents of VenomKB to Neo4j.

Eventually this script will be merged into a more comprehensive module
structure for VenomKB-related Python code.
"""

from __future__ import print_function, absolute_import

import unittest
import configparser
import freeze_database as db

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
      self.assertEqual(nb[5][1], len(data.species))
      self.assertEqual(nb[4][1], len(data.proteins))
      self.assertEqual(nb[1][1], len(categories))

      nb_predication = 0
      for protein in data.proteins:
        if 'literature_predications' in protein:
          nb_predication += len(protein["literature_predications"])
      self.assertEqual(nb[3][1], nb_predication)

      nb_gene_ontology = 0
      for protein in data.proteins:
        if 'go_annotations' in protein:
          nb_gene_ontology += len(protein["go_annotations"])
      self.assertEqual(nb[0][1], nb_gene_ontology)

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
      self.assertEqual(
          properties[0], "Coagulation factor X-activating enzyme heavy chain")
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
      self.assertEqual(
          properties[3], "MKTLLLTLVMVTIMCLDLGYTLTCYKGYHDTVVCKPHETICYRYLIPATHGNAIPARGCGTSCPGGNHPVCCSTDLCNK")
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
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
      res = neo.print_pfam("P6421031")
      self.assertEqual(res[0], "Lipase")
      res = neo.print_pfam("P3214280")
      self.assertEqual(res, None)
      res = neo.print_pfam("P9908634")
      self.assertEqual(res, None)

    def test_properties_species(self):
      # Species example Lachesana tarabaevi
      neo = db.NeoSimpleStat(URI, USER, PASSWORD)
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
  unittest.main()

