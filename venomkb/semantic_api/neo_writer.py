from neo4j.v1 import GraphDatabase
import configparser

ENVIRONMENT = 'DEV'

config = configparser.ConfigParser()
config.read('./venomkb-neo4j.cfg')

HOSTNAME = config[ENVIRONMENT]['Hostname']
USER = config[ENVIRONMENT]['User']
PASSWORD = config[ENVIRONMENT]['Password']
PORT = config['DEFAULT']['Port']
URI = "bolt://{0}:{1}".format(HOSTNAME, PORT)


class Neo4jWriter(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_generate_graph(self, proteins, species_list, categories):
    """This function create a neo4j graph.

          Args:
            proteins (array of object):  An array containing all the proteins that will be add to the graph.
            Each protein should at least has a name, a venomkb_id, an annotation score, an aa_sequence and a UnitProtKB_id.
            A protein can also have literature predication, separate nodes will be created and linked, and some gene
            ontologies, separate nodes will be created and linked.

            species (array of object): An array of object containing all the species that will be add as nodes to the graph.
            Each species should at least have a name, a venomkb_id, a score and a list a protein.

            categories (array of string): an array containing all the ontology class.

          Returns:
            A neo4j graph located in /neo4j-community-3.4/data/databases/graph.db
      """
    self.purge()
    # add category
    for category in categories:
      self.print_category_nodes(category)

    self.print_is_a_subclass_relationship(
        "Peptide", "Biological_Macromolecule")
    self.print_is_a_subclass_relationship(
        "Carbohydrate", "Biological_Macromolecule")
    self.print_is_a_subclass_relationship(
        "Biological_Macromolecule", "Molecule")
    self.print_is_a_subclass_relationship("Inorganic_Molecule", "Molecule")
    self.print_is_a_subclass_relationship("Whole_Venom_Extract", "Mixture")
    self.print_is_a_subclass_relationship("Molecule", "Chemical_Compound")
    self.print_is_a_subclass_relationship("Mixture", "Chemical_Compound")
    self.print_is_a_subclass_relationship(
        "Synthetic_Venom_Derivative", "Chemical_Compound")
    self.print_is_a_subclass_relationship("Chemical_Compound", "Venom")
    self.print_is_a_subclass_relationship("Venomous_Organism", "Thing")
    self.print_is_a_subclass_relationship("Venom", "Thing")

    pfam_added = []
    # add proteins
    for protein in proteins:
      self.print_protein(protein["name"], protein["venomkb_id"], protein["annotation_score"],
                         protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])

      if 'Pfam' in protein["out_links"]:
        pfam = protein["out_links"]["Pfam"]["attributes"]["name"]
        if pfam not in pfam_added:
          self.print_pfam_node(pfam)
          pfam_added.append(pfam)
        self.print_pfam_relationship(protein["venomkb_id"], pfam)

      if 'go_annotations' in protein:
        for elt in protein["go_annotations"]:
          self.print_is_a_go_relation_and_node(
              protein["venomkb_id"], elt["evidence"], elt["term"], elt["id"], elt["project"])

      if 'literature_predications' in protein:
        if type(protein["literature_predications"][0]) == list:
          for elt in protein["literature_predications"][0]:
            self.print_predication_relation_and_node(
                protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])
        else:
          for elt in protein["literature_predications"]:
            self.print_predication_relation_and_node(
                protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"])

  # add species
    for species in species_list:
      self.print_species(
          species["name"], species["venomkb_id"], species["annotation_score"])
      for protein in species["venom"]["proteins"]:
        self.print_link(species["name"], protein)

  def print_species(self, name, venomkb_id, score):
    """This function create a species node into the graph.
    It links the node to the Venomous_Organism node with a "is instance of" link.

          Args:
            name (string): the species'name
            venomkb_id (string): a unique identifier for the species, must start with a 'S'
            score (int): an annotation score for the data between 1 and 5

          Returns:
            No return
      """
    with self._driver.session() as session:
      species = session.write_transaction(
          self._add_species, (name, venomkb_id, score))
      print(species)

  def print_protein(self, name, venomkb_id, score, aa_sequence, UnitProtKB_id):
    """This function create a protein node into the graph.
    It links the node to the Peptide node with a "is instance of" link

          Args:
            name (string): the protein's name
            venomkb_id (string): a unique identifier for the protein, must start with a 'P'
            score (int): an annotation score for the data between 1 and 5
            aa_sequence (string): amino acid sequence of the protein
            UnitProtKB_id (string)

          Returns:
            No return
      """
    with self._driver.session() as session:
      protein = session.write_transaction(
          self._add_protein, (name, venomkb_id, score, aa_sequence, UnitProtKB_id))
      print(protein)

  def print_category_nodes(self, name):
    """This function create an ontology class node into the graph.

          Args:
            name (string): the name of the ontology class

          Returns:
            No return
    """
    with self._driver.session() as session:
      category = session.write_transaction(self._add_nodes_category, name)
      print(category)

  def print_pfam_node(self, pfam):
    """This function create a protein family (alias pfam) node into the graph.

          Args:
            name (string): the protein family's name

          Returns:
            No return
    """
    with self._driver.session() as session:
      pfam = session.write_transaction(self._add_nodes_pfam, pfam)
      print(pfam)

  def print_link(self, species, protein_id):
    """This function add a link between a species and a protein into the graph.

          Args:
            species (string): the name of the species that will be linked
            protein_id (string): the venomkb_id of the protein that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_relationship, (species, protein_id))
      print(relationship)

  def print_protein_peptide_relationship(self, protein_id):
    """This function add a link between a protein and the "Peptide" node which is an onlogy class.

          Args:
            protein_id (string): the venomkb_id of the protein that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_protein_peptide_relationship, protein_id)
      print(relationship)

  def print_specie_organism_relationship(self, species_id):
    """This function add a link between a species and the "Venomous Organism" node which is an onlogy class.

          Args:
            species_id (string): the venomkb_id of the species that will be linked

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_species_organism_relationship, species_id)
      print(relationship)

  def print_is_a_subclass_relationship(self, category_a, category_b):
    """This function add a link between 2 onlogy classes : "a is a subclass of b"

          Args:
            category_a (string): the name of the onlogy class
            category_b (string): the name of the onlogy class

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_is_a_relationship, (category_a, category_b))
      print(relationship)

  def print_pfam_relationship(self, protein_id, pfam):
    """This function add a link a protein and a pfam.

          Args:
            protein_id (string): the venomkb_id of the protein
            pfam (string): the name of protein family

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_pfam_relation, (protein_id, pfam))
      print(relationship)

  def print_is_a_go_relation_and_node(self, protein_id, evidence, term, go_id, project):
    """This function create a node for a gene ontology, and link this node to the correct protein.

          Args:
            protein_id (string): the venomkb_id of the protein
            evidence (string): evidence of the gene ontology
            term (string): term of the gene ontology
            go_id (string): a specific id for the gene ontology
            project (string): the name of the project in the gene ontology

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_is_a_go_relation_and_node, (protein_id, evidence, term, go_id, project))
      print(relationship)

  def print_predication_relation_and_node(self, protein_id,  s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid):
    """This function create a node for a literature predication, and link this node to the correct protein.

          Args:
            protein_id (string): the venomkb_id of the protein
            s_name (string):
            s_cui (string):
            s_type (string):
            o_cui (string):
            o_name (string):
            o_type (string):
            predicate (string):
            pmid (string):

          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_predication_relation_and_node, (
          protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid))
      print(relationship)

  def purge(self):
    """This function all elements from the database

          Args:
            No args

          Returns:
            The transactions that deleted all elements
    """

    with self._driver.session() as session:
      del_all = session.write_transaction(self._purge_db_contents)
      return del_all

  @staticmethod
  def _add_species(tx, payload):
    (name, venomkb_id, score) = payload
    statement = """MATCH (b:OntologyClass) WHERE b.name = "Venomous_Organism"
                    CREATE (a:Species {name : {name}, vkbid: {venomkb_id}, score:{score}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
    result = tx.run(statement, name=name, venomkb_id=venomkb_id, score=score)
    return result.single()[0]

  @staticmethod
  def _add_protein(tx, payload):
    (name, venomkb_id, score, aa_sequence, UnitProtKB_id) = payload
    statement = """MATCH (b:OntologyClass) WHERE b.name = "Peptide"
                    CREATE (a:Protein {name : {name}, vkbid: {venomkb_id}, score:{score}, aa_sequence: {aa_sequence}, UnitProtKB_id: {UnitProtKB_id}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
    result = tx.run(statement, name=name, venomkb_id=venomkb_id,
                    score=score, aa_sequence=aa_sequence, UnitProtKB_id=UnitProtKB_id)
    return result.single()[0]

  @staticmethod
  def _add_nodes_category(tx, name):
    statement = """CREATE (a:OntologyClass {name : {name}})
                   RETURN a.name +', from node ' + id(a)"""
    result = tx.run(statement, name=name)
    return result.single()[0]

  @staticmethod
  def _add_nodes_pfam(tx, name):
    statement = """CREATE (a:Pfam {name : {name}})
                RETURN a.name +', from node ' + id(a)"""
    result = tx.run(statement, name=name)
    return result.single()[0]

  @staticmethod
  def _add_relationship(tx, payload):
    (species, protein_id) = payload
    statement = """MATCH (a:Species {name: {species}}),
                (b:Protein {vkbid : {protein_id}})
                CREATE (a)-[r:HAS_VENOM_COMPONENT]->(b)
                RETURN r"""
    result = tx.run(statement, {"species": species, "protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_protein_peptide_relationship(tx, protein_id):
    statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:OntologyClass {name : "Peptide"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"protein_id": protein_id})
    return result.single()[0]

  @staticmethod
  def _add_species_organism_relationship(tx, species_id):
    statement = """MATCH (a:Species {vkbid : {species_id}}),
                (b:OntologyClass {name : "Venomous_Organism"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
    result = tx.run(statement, {"species_id": species_id})
    return result.single()[0]

  @staticmethod
  def _add_is_a_relationship(tx, categories):
    (category_a, category_b) = categories
    statement = """MATCH (a:OntologyClass {name : {category_a}}),
                (b:OntologyClass {name : {category_b}})
                CREATE (a)-[r:IS_A_SUBCLASS_OF]->(b)
                RETURN r"""
    result = tx.run(
        statement, {"category_a": category_a, "category_b": category_b})
    return result.single()[0]

  @staticmethod
  def _add_pfam_relation(tx, payload):
    (protein_id, pfam) = payload
    statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:Pfam  {name : {pfam}})
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
    result = tx.run(statement, {"protein_id": protein_id, "go_id": go_id,
                                "term": term, "evidence": evidence, "project": project})
    return result.single()[0]

  @staticmethod
  def _add_predication_relation_and_node(tx, payload):
    (protein_id, s_name, s_cui, s_type, o_cui,
     o_name, o_type, predicate, pmid) = payload
    statement = """MATCH (p:Protein) where p.vkbid={protein_id}
                CREATE (lp:Predication {s_name:{s_name}, s_cui:{s_cui}, s_type:{s_type}, o_cui:{o_cui}, o_name:{o_name}, o_type:{o_type}, predicate:{predicate}, pmid:{pmid}})
                CREATE((p)-[:HAS_A_PL]->(lp))
                RETURN lp"""
    result = tx.run(statement, {"protein_id": protein_id, "s_name": s_name, "s_cui": s_cui, "s_type": s_type,
                                "o_name": o_name, "o_cui": o_cui, "o_type": o_type, "predicate": predicate, "pmid": pmid})
    return result.single()[0]

  @staticmethod
  def _purge_db_contents(tx):
    result = tx.run("MATCH (n)"
                    "DETACH DELETE n")
    return result
