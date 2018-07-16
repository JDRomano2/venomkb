from neo4j.v1 import GraphDatabase
import ipdb
import configparser


class Neo4jWriter(object):
    def __init__(self, uri, user, password, verbose=False):
        self._driver = GraphDatabase.driver(uri, auth=(user, password))
        self.verbose = verbose

    def close(self):
        self._driver.close()

    def generate_graph(self, proteins, species_list, genomes, systemic_effects, classes):
        """This function create a neo4j graph.

              Args:
                proteins (array of object):  An array containing all the proteins that will be add to the graph.
                Each protein should at least have a name, a venomkb_id, an annotation score, an aa_sequence and a UniProtKB_id.
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
        self.purge()  # start by nuking the contents of the graph database

        # Create ontology classes
        for ontology_class in classes:
            self.ont_class_nodes(ontology_class)

        # Hierarchical relations
        self.is_a_subclass_relationship("Protein", "BiologicalMacromolecule")
        self.is_a_subclass_relationship("Carbohydrate", "BiologicalMacromolecule")
        self.is_a_subclass_relationship("BiologicalMacromolecule", "Molecule")
        self.is_a_subclass_relationship("InorganicMolecule", "Molecule")
        self.is_a_subclass_relationship("Venom", "Mixture")
        self.is_a_subclass_relationship("Molecule", "ChemicalCompound")
        self.is_a_subclass_relationship("Mixture", "ChemicalCompound")
        self.is_a_subclass_relationship("SyntheticVenomDerivative", "ChemicalCompound")
        self.is_a_subclass_relationship("ChemicalCompound", "Venom")
        self.is_a_subclass_relationship("Species", "Thing")
        self.is_a_subclass_relationship("Genome", "Thing")
        self.is_a_subclass_relationship("SystemicEffect", "Thing")
        self.is_a_subclass_relationship("VenomSeqData", "Thing")

        # Explicit nonhierarchical relations
        self.add_ontology_class_relationship("Venom", "Molecule", "HAS_VENOM_COMPONENT")
        self.add_ontology_class_relationship("Molecule", "Venom", "HAS_DERIVATIVE_COMPOUND")
        self.add_ontology_class_relationship("Venom", "Species", "SPECIES_OF_ORIGIN")
        self.add_ontology_class_relationship("Species", "Venom", "HAS_VENOM")
        self.add_ontology_class_relationship("SyntheticVenomDerivative", "Molecule", "IS_DERIVATIVE_OF")
        self.add_ontology_class_relationship("Molecule", "SyntheticVenomDerivative", "HAS_DERIVATIVE_COMPOUND")
        self.add_ontology_class_relationship("SystemicEffect", "Protein", "INFLUENCED_BY_PROTEIN")
        self.add_ontology_class_relationship("Protein", "SystemicEffect", "INFLUENCES_SYSTEMIC_EFFECT")
        self.add_ontology_class_relationship("Species", "VenomSeqData", "HAS_VENOMSEQ_DATASET")
        self.add_ontology_class_relationship("VenomSeqData", "Species", "VENOMSEQ_DATA_FOR_SPECIES")

        # Imputed nonhierarchical relations
        # (i.e., "shortcuts for venomkb")
        self.add_ontology_class_relationship("Species", "Protein", "SPECIES_HAS_PROTEIN")
        self.add_ontology_class_relationship("Protein", "Species", "PROTEIN_FROM_SPECIES")
        self.add_ontology_class_relationship("Species", "Genome", "SPECIES_HAS_GENOME")
        self.add_ontology_class_relationship("Genome", "Species", "GENOME_FROM_SPECIES")
        self.add_ontology_class_relationship("Pfam", "Protein", "CONTAINS_PROTEIN")
        self.add_ontology_class_relationship("Protein", "Pfam", "IN_FAMILY")

        pfam_added = []
        # add proteins
        for protein in proteins:
            self.protein(protein["name"], protein["venomkb_id"], protein["annotation_score"],
                         protein["aa_sequence"], protein["out_links"]["UniProtKB"]["id"])

            if 'Pfam' in protein["out_links"]:
                pfam = protein["out_links"]["Pfam"]["attributes"]["name"]
                if pfam not in pfam_added:
                    self.pfam_node(pfam)
                    pfam_added.append(pfam)
                self.pfam_relationship(protein["venomkb_id"], pfam)

            # if 'go_annotations' in protein:
            #     for elt in protein["go_annotations"]:
            #         self.is_a_go_relation_and_node(
            #             protein["venomkb_id"], elt["evidence"], elt["term"], elt["id"], elt["project"])

            if 'literature_predications' in protein:
                if type(protein["literature_predications"][0]) == list:
                    for elt in protein["literature_predications"][0]:
                        self.predication_relation_and_node(
                            protein["venomkb_id"],
                            elt["s_name"],
                            elt["s_cui"],
                            elt["s_type"],
                            elt["o_name"],
                            elt["o_cui"],
                            elt["o_type"],
                            elt["predicate"],
                            elt["PMID"])
                else:
                    for elt in protein["literature_predications"]:
                        self.predication_relation_and_node(
                            protein["venomkb_id"],
                            elt["s_name"],
                            elt["s_cui"],
                            elt["s_type"],
                            elt["o_name"],
                            elt["o_cui"],
                            elt["o_type"],
                            elt["predicate"],
                            elt["PMID"])

        # add species
        for species in species_list:
            self.species(
                species["name"], species["venomkb_id"], species["annotation_score"])
            for protein in species["venom"]["proteins"]:
                self.link(species["name"], protein)

        for systemic_effect in systemic_effects:
            self.systemic_effect_node(systemic_effect["name"], systemic_effect["venomkb_id"], systemic_effect["eco_id"])
            venomkb_id = systemic_effect["venomkb_id"]
            for protein in systemic_effect["proteins"]:
                self.protein_systemic_relationship(protein, venomkb_id)
        # add genomes
        for genome in genomes:
            self.genome(
                genome["name"],
                genome["venomkb_id"],
                genome["annotation_score"],
                genome["literature_reference"]["journal"],
                genome["out_links"]["ncbi_genome"]["link"],
                genome["species_ref"])

    def species(self, name, venomkb_id, score):
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
            if self.verbose:
                print(species)

    def protein(self, name, venomkb_id, score, aa_sequence, UniProtKB_id):
        """This function create a protein node into the graph.
        It links the node to the Peptide node with a "is instance of" link

              Args:
                name (string): the protein's name
                venomkb_id (string): a unique identifier for the protein, must start with a 'P'
                score (int): an annotation score for the data between 1 and 5
                aa_sequence (string): amino acid sequence of the protein
                UniProtKB_id (string)
                verbose (boolean) : if true, print the result of the transaction


              Returns:
                No return
          """
        with self._driver.session() as session:
            protein = session.write_transaction(
                self._add_protein, (name, venomkb_id, score, aa_sequence, UniProtKB_id))
            if self.verbose:
                print(protein)

    def genome(self, name, venomkb_id, score, journal, link, species_id):
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
            if self.verbose:
                print(genome)
    
    def venomSeqData(self, name, venomkb_id, species_ref, genes_up, genes_down):
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
            venomSeq = session.write_transaction(
                self._add_venomSeqData, (name, venomkb_id, species_ref,
                                         genes_up, genes_down))
            if self.verbose:
                print(venomSeq)

    def gene(self, entrezGeneId,  pvalue, log2FoldChange, baseMean, venomkb_id):
        """This function create a gene node into the graph.
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
            gene = session.write_transaction(
                self._add_gene, (entrezGeneId, pvalue,
                                 log2FoldChange, baseMean, venomkb_id))
            if self.verbose:
                print(gene)

    def ont_class_nodes(self, name):
        """This function create an ontology class node into the graph.

              Args:
                name (string): the name of the ontology class
                verbose (boolean) : if true, print the result of the transaction


              Returns:
                No return
        """
        with self._driver.session() as session:
            category = session.write_transaction(self._add_nodes_category, name)
            if self.verbose:
                print(category)

    def pfam_node(self, pfam):
        """This function create a protein family (alias pfam) node into the graph.

              Args:
                name (string): the protein family's name
                verbose (boolean) : if true, print the result of the transaction


              Returns:
                No return
        """
        with self._driver.session() as session:
            pfam = session.write_transaction(self._add_nodes_pfam, pfam)
            if self.verbose:
                print(pfam)

    def systemic_effect_node(self, name, venomkb_id, eco_id):
        """This function create a systemic effect node into the graph

              Args:
                name (string): the systemic effect name
                venomkb_id (string): venomkb_id of the systemic effect
                eco_id (string):
                verbose (boolean) : if true, print the result of the transaction


              Returns:
                No return
        """
        with self._driver.session() as session:
            systemic_effect = session.write_transaction(self._add_nodes_systemic_effect, (name, venomkb_id, eco_id))
            if self.verbose:
                print(systemic_effect)

    def link(self, species, protein_id):
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
            if self.verbose:
                print(relationship)

    def protein_peptide_relationship(self, protein_id):
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
            if self.verbose:
                print(relationship)

    def protein_systemic_relationship(self, protein_id, systemic_id):
        """This function add a link between a protein and q systemic effect.

              Args:
                protein_id (string): the venomkb_id of the protein that will be linked
                systemic_id (string): the venomkb_id of the systemic_effect that will be linked
                verbose (boolean) : if true, print the result of the transaction


              Returns:
                No return
        """
        with self._driver.session() as session:
            relationship = session.write_transaction(
                self._add_protein_systemic_relationship, (protein_id, systemic_id))
            if self.verbose:
                print(relationship)

    def specie_organism_relationship(self, species_id):
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
            if self.verbose:
                print(relationship)

    def is_a_subclass_relationship(self, category_a, category_b):
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
            if self.verbose:
                print(relationship)

    def add_ontology_class_relationship(self,
                                        class_a,
                                        class_b,
                                        rel_label):
        with self._driver.session() as session:
            relationship = session.write_transaction(
                self._run_ontology_class_relationship, (class_a, class_b, rel_label)
            )
            if self.verbose:
                print(relationship)

    def pfam_relationship(self, protein_id, pfam):
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
            if self.verbose:
                print(relationship)

    def is_a_go_relation_and_node(self, protein_id, evidence, term, go_id, project):
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
            if self.verbose:
                print(relationship)

    def predication_relation_and_node(self, protein_id,  s_name, s_cui, s_type, o_cui, o_name, o_type, predicate, pmid):
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
            if self.verbose:
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
            if self.verbose:
                print("PURGE DATABASE")
                print()
            return del_all

    @staticmethod
    def _add_species(tx, payload):
        (name, venomkb_id, score) = payload
        statement = """MATCH (b:OntologyClass) WHERE b.name = "Species"
                    CREATE (a:Species {name : {name}, vkbid: {venomkb_id}, score:{score}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
        result = tx.run(statement, name=name, venomkb_id=venomkb_id, score=score)
        return result.single()[0]

    @staticmethod
    def _add_protein(tx, payload):
        (name, venomkb_id, score, aa_sequence, UniProtKB_id) = payload
        statement = """MATCH (b:OntologyClass) WHERE b.name = "Protein"
                    CREATE (a:Protein {name : {name}, vkbid: {venomkb_id}, score:{score}, aa_sequence: {aa_sequence}, UniProtKB_id: {UniProtKB_id}})
                    CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                    RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
        result = tx.run(statement, name=name, venomkb_id=venomkb_id,
                        score=score, aa_sequence=aa_sequence, UniProtKB_id=UniProtKB_id)
        return result.single()[0]

    @staticmethod
    def _add_genome(tx, payload):
        (name, venomkb_id, score, journal, link, species_id) = payload
        statement = """MATCH (s:Species) WHERE s.vkbid = {species_id}
            CREATE (a:Genome {name : {name}, vkbid: {venomkb_id}, score:{score}, journal: {journal}, link: {link}})
            CREATE (s)-[r:SPECIES_HAS_GENOME]->(a)
            CREATE (a)-[q:GENOME_FROM_SPECIES]->(s)
            RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
        result = tx.run(statement, name=name, venomkb_id=venomkb_id,
                        score=score, journal=journal, link=link, species_id=species_id)
        return result.single()[0]

    @staticmethod
    def _add_venomSeqData(tx, payload):
        (name, venomkb_id, species_ref, genes_up, genes_down) = payload
        statement = """MATCH (s:Species) WHERE s.vkbid = {species_ref}
            CREATE (v:VenomSeqData {name : {name}, vkbid: {venomkb_id}, genes_up:{genes_up}, genes_down: {genes_down}})
            CREATE (v)-[r:VENOMSEQ_DATA_FOR_SPECIES]->(s)
            CREATE (s)-[q:HAS_VENOMSEQ_DATASET]->(v)
            RETURN v.name +', '+ v.vkbid + ', from node ' + id(v)"""
        result = tx.run(statement, name=name, venomkb_id=venomkb_id,
                        genes_up=genes_up, genes_down=genes_down, species_ref=species_ref)
        return result.single()[0]

    @staticmethod
    def _add_gene(tx, payload):
        (entrezGeneId, pvalue, log2FoldChange, baseMean, venomkb_id) = payload
        statement = """MATCH (v:VenomSeqData {vkbid : {venomkb_id}})
        MERGE (h:Gene {entrezGeneId: {entrezGeneId}, pvalue: {pvalue}, log2FoldChange: {log2FoldChange}, baseMean: {baseMean}})
        CREATE (v)-[r:HAS_GENE]->(h)
        CREATE (h)-[q:IN_VENOM_SEQ]->(v)
        RETURN h"""
        result=tx.run(statement, entrezGeneId=entrezGeneId,
                      pvalue=pvalue, log2FoldChange=log2FoldChange, baseMean=baseMean, venomkb_id=venomkb_id)
        return result.single()

    @staticmethod
    def _add_nodes_systemic_effect(tx, payload):
        (name, venomkb_id, eco_id) = payload
        statement = """CREATE (a:SystemicEffect {name : {name}, vkbid: {venomkb_id}, eco_id: {eco_id}})
            RETURN a.name +', '+ a.vkbid + ', from node ' + id(a)"""
        result = tx.run(statement, name=name, venomkb_id=venomkb_id, eco_id=eco_id)
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
                CREATE (b)-[r:PROTEIN_FROM_SPECIES]->(a)
                CREATE (a)-[s:SPECIES_HAS_PROTEIN]->(b)
                RETURN r"""
        result = tx.run(statement, {"species": species, "protein_id": protein_id})
        return result.single()[0]

    @staticmethod
    def _add_protein_peptide_relationship(tx, protein_id):
        statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:OntologyClass {name : "Protein"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
        result = tx.run(statement, {"protein_id": protein_id})
        return result.single()[0]

    @staticmethod
    def _add_protein_systemic_relationship(tx, payload):
        (protein_id, systemic_id) = payload
        statement = """MATCH (p:Protein {vkbid : {protein_id}}),
                (se:SystemicEffect {vkbid : {systemic_id}})
                CREATE (p)-[r:INFLUENCES_SYSTEMIC_EFFECT]->(se)
                CREATE (se)-[q:INFLUENCED_BY_PROTEIN]->(p)
                RETURN r"""
        result = tx.run(statement, {"protein_id": protein_id, "systemic_id": systemic_id})
        return result.single()[0]

    @staticmethod
    def _add_species_organism_relationship(tx, species_id):
        statement = """MATCH (a:Species {vkbid : {species_id}}),
                (b:OntologyClass {name : "Species"})
                CREATE (a)-[r:IS_INSTANCE_OF]->(b)
                RETURN r"""
        result = tx.run(statement, {"species_id": species_id})
        return result.single()[0]

    @staticmethod
    def _add_is_a_relationship(tx, categories):
        (category_a, category_b) = categories
        statement = """MATCH (a:OntologyClass {name : {category_a}}),
                (b:OntologyClass {name : {category_b}})
                CREATE (a)-[r:IS_SUBCLASS_OF]->(b)
                RETURN r"""
        result = tx.run(
            statement, {"category_a": category_a, "category_b": category_b})
        return result.single()[0]

    @staticmethod
    def _run_ontology_class_relationship(tx, payload):
        (class_a, class_b, relationship) = payload
        statement = """MATCH (a:OntologyClass {{name : {{class_a}} }}),
                (b:OntologyClass {{name : {{class_b}} }})
                CREATE (a)-[r:{0}]->(b)
                RETURN r""".format(relationship)
        result = tx.run(
            statement, {
                "class_a": class_a,
                "class_b": class_b
            }
        )
        return result.single()[0]

    @staticmethod
    def _add_pfam_relation(tx, payload):
        (protein_id, pfam) = payload
        statement = """MATCH (a:Protein {vkbid : {protein_id}}),
                (b:Pfam  {name : {pfam}})
                CREATE (a)-[r:IN_FAMILY]->(b)
                CREATE (b)-[q:CONTAINS_PROTEIN]->(a)
                RETURN r"""
        result = tx.run(statement, {"protein_id": protein_id, "pfam": pfam})
        return result.single()[0]

    @staticmethod
    def _add_is_a_go_relation_and_node(tx, payload):
        (protein_id, evidence, term, go_id, project) = payload
        statement = """MATCH (prot:Protein) where prot.vkbid={protein_id}
                CREATE (go:GeneOntology {goid:{go_id}, term:{term}, evidence:{evidence}, project:{project}})
                CREATE((prot)-[:HAS_GO_ANNOTATION]->(go))
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
                CREATE((p)-[:HAS_PREDICATION]->(lp))
                RETURN lp"""
        result = tx.run(
            statement,
            {"protein_id": protein_id, "s_name": s_name, "s_cui": s_cui, "s_type": s_type, "o_name": o_name,
             "o_cui": o_cui, "o_type": o_type, "predicate": predicate, "pmid": pmid})
        return result.single()[0]

    @staticmethod
    def _purge_db_contents(tx):
        result = tx.run("MATCH (n)"
                        "DETACH DELETE n")
        return result
