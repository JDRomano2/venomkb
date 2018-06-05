from neo4j.v1 import GraphDatabase
import configparser

class Neo4jWriter(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def generate_graph(self, proteins, species_list, genomes, categories, verbose=False):
    """This function create a neo4j graph.

          Args:
            proteins (array of object):  An array containing all the proteins that will be add to the graph.
            Each protein should at least have a name, a venomkb_id, an annotation score, an aa_sequence and a UnitProtKB_id.
            A protein can also have literature predication, separate nodes will be created and linked, and some gene
            ontologies, separate nodes will be created and linked.

            species (array of object): An array of object containing all the species that will be add as nodes to the graph.
            Each species should at least have a name, a venomkb_id, a score and a list a protein.

            genomes (array of object): An array of object containing all the genomes that will be add as nodes to the graph.
            Each genome should at least have a name, a venomkb_ib, a score, a journal, a link, a species_id


            categories (array of string): an array containing all the ontology class.

            verbose (boolean) : if true, print the result of the transaction

          Returns:
            A neo4j graph located in /neo4j-community-3.4/data/databases/graph.db
      """
    self.purge()
    # add category
    for category in categories:
      self.category_nodes(category, verbose)

    self.is_a_subclass_relationship(
        "Peptide", "Biological_Macromolecule", verbose)
    self.is_a_subclass_relationship(
        "Carbohydrate", "Biological_Macromolecule", verbose)
    self.is_a_subclass_relationship(
        "Biological_Macromolecule", "Molecule", verbose)
    self.is_a_subclass_relationship("Inorganic_Molecule", "Molecule", verbose)
    self.is_a_subclass_relationship("Whole_Venom_Extract", "Mixture", verbose)
    self.is_a_subclass_relationship("Molecule", "Chemical_Compound", verbose)
    self.is_a_subclass_relationship("Mixture", "Chemical_Compound", verbose)
    self.is_a_subclass_relationship(
        "Synthetic_Venom_Derivative", "Chemical_Compound", verbose)
    self.is_a_subclass_relationship("Chemical_Compound", "Venom", verbose)
    self.is_a_subclass_relationship("Venomous_Organism", "Thing", verbose)
    self.is_a_subclass_relationship("Venom", "Thing", verbose)

    pfam_added = []
    # add proteins
    for protein in proteins:
      self.protein(protein["name"], protein["venomkb_id"], protein["annotation_score"],
                   protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"], verbose)

      if 'Pfam' in protein["out_links"]:
        pfam = protein["out_links"]["Pfam"]["attributes"]["name"]
        if pfam not in pfam_added:
          self.pfam_node(pfam)
          pfam_added.append(pfam)
        self.pfam_relationship(protein["venomkb_id"], pfam, verbose)

      if 'go_annotations' in protein:
        for elt in protein["go_annotations"]:
          self.is_a_go_relation_and_node(
              protein["venomkb_id"], elt["evidence"], elt["term"], elt["id"], elt["project"], verbose)

      if 'literature_predications' in protein:
        if type(protein["literature_predications"][0]) == list:
          for elt in protein["literature_predications"][0]:
            self.predication_relation_and_node(
                protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"], verbose)
        else:
          for elt in protein["literature_predications"]:
            self.predication_relation_and_node(
                protein["venomkb_id"], elt["s_name"], elt["s_cui"], elt["s_type"], elt["o_name"], elt["o_cui"], elt["o_type"], elt["predicate"], elt["PMID"], verbose)

    # add species
    for species in species_list:
      self.species(
          species["name"], species["venomkb_id"], species["annotation_score"], verbose)
      for protein in species["venom"]["proteins"]:
        self.link(species["name"], protein, verbose)

    # add genomes
    for genome in genomes:
      self.genome(genome["name"], genome["venomkb_id"], genome["annotation_score"], genome["literature_reference"]["journal"],
                  genome["out_links"]["ncbi_genome"]["link"], genome["species_ref"], verbose)

  def species(self, name, venomkb_id, score, verbose=False):
    """This function create a species node into the graph.
    It links the node to the Venomous_Organism node with a "is instance of" link.

          Args:
            name (string): the species'name
            venomkb_id (string): a unique identifier for the species, must start with a 'S'
            score (int): an annotation score for the data between 1 and 5
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
      """
    with self._driver.session() as session:
      species = session.write_transaction(
          self._add_species, (name, venomkb_id, score))
      if verbose:
        print(species)

  def protein(self, name, venomkb_id, score, aa_sequence, UnitProtKB_id, verbose=False):
    """This function create a protein node into the graph.
    It links the node to the Peptide node with a "is instance of" link

          Args:
            name (string): the protein's name
            venomkb_id (string): a unique identifier for the protein, must start with a 'P'
            score (int): an annotation score for the data between 1 and 5
            aa_sequence (string): amino acid sequence of the protein
            UnitProtKB_id (string)
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
      """
    with self._driver.session() as session:
      protein = session.write_transaction(
          self._add_protein, (name, venomkb_id, score, aa_sequence, UnitProtKB_id))
      if verbose:
        print(protein)

  def genome(self, name, venomkb_id, score, journal, link, species_id, verbose=False):
    """This function create a genome node into the graph.
    It links the node to the node with a "is instance of" link
    It links the node to the correct species node with as "has genome" link

          Args:
            name (string): the protein's name
            venomkb_id (string): a unique identifier for the protein, must start with a 'P'
            score (int): an annotation score for the data between 1 and 5
            journal (string): name of the journal
            link (string): url that refers to the genome
            species_id (string): the venomkb_id of the species linked
            verbose (boolean) : if true, print the result of the transaction

          Returns:
            No return
      """
    with self._driver.session() as session:
      genome = session.write_transaction(
          self._add_genome, (name, venomkb_id, score,
                              journal, link, species_id))
      if verbose:
        print(genome)

  def category_nodes(self, name, verbose=False):
    """This function create an ontology class node into the graph.

          Args:
            name (string): the name of the ontology class
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      category = session.write_transaction(self._add_nodes_category, name)
      if verbose:
        print(category)

  def pfam_node(self, pfam, verbose=False):
    """This function create a protein family (alias pfam) node into the graph.

          Args:
            name (string): the protein family's name
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      pfam = session.write_transaction(self._add_nodes_pfam, pfam)
      if verbose:
        print(pfam)

  def link(self, species, protein_id, verbose=False):
    """This function add a link between a species and a protein into the graph.

          Args:
            species (string): the name of the species that will be linked
            protein_id (string): the venomkb_id of the protein that will be linked
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_relationship, (species, protein_id))
      if verbose:
        print(relationship)

  def protein_peptide_relationship(self, protein_id, verbose=False):
    """This function add a link between a protein and the "Peptide" node which is an onlogy class.

          Args:
            protein_id (string): the venomkb_id of the protein that will be linked
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_protein_peptide_relationship, protein_id)
      if verbose :
       print(relationship)

  def specie_organism_relationship(self, species_id, verbose=False):
    """This function add a link between a species and the "Venomous Organism" node which is an onlogy class.

          Args:
            species_id (string): the venomkb_id of the species that will be linked
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_species_organism_relationship, species_id)
      if verbose:
        print(relationship)

  def is_a_subclass_relationship(self, category_a, category_b, verbose=False):
    """This function add a link between 2 onlogy classes : "a is a subclass of b"

          Args:
            category_a (string): the name of the onlogy class
            category_b (string): the name of the onlogy class
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_is_a_relationship, (category_a, category_b))
      if verbose:
        print(relationship)

  def pfam_relationship(self, protein_id, pfam, verbose=False):
    """This function add a link a protein and a pfam.

          Args:
            protein_id (string): the venomkb_id of the protein
            pfam (string): the name of protein family
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_pfam_relation, (protein_id, pfam))
      if verbose:
        print(relationship)

  def is_a_go_relation_and_node(self, protein_id, evidence, term, go_id, project, verbose=False):
    """This function create a node for a gene ontology, and link this node to the correct protein.

          Args:
            protein_id (string): the venomkb_id of the protein
            evidence (string): evidence of the gene ontology
            term (string): term of the gene ontology
            go_id (string): a specific id for the gene ontology
            project (string): the name of the project in the gene ontology
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(
          self._add_is_a_go_relation_and_node, (protein_id, evidence, term, go_id, project))
      if verbose:
        print(relationship)

  def predication_relation_and_node(self, protein_id,  s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid, verbose=False):
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
            verbose (boolean) : if true, print the result of the transaction


          Returns:
            No return
    """
    with self._driver.session() as session:
      relationship = session.write_transaction(self._add_predication_relation_and_node, (
          protein_id, s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid))
      if verbose:
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
  def _add_genome(tx, payload):
    (name, venomkb_id, score, journal, link, species_id) = payload
    statement="""MATCH (s:Species) WHERE s.vkbid = {species_id}
            CREATE (a:Genome {name : {name}, vkbid: {venomkb_id}, score:{score}, journal: {journal}, link: {link}})
            CREATE (s)-[r:HAS_GENOME]->(a)
            RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
    result=tx.run(statement, name=name, venomkb_id=venomkb_id,
                score=score, journal=journal, link=link, species_id=species_id)
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
