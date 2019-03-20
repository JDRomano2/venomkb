import React from 'react';

const AboutOntology = () =>
  <div className="jumbotron">
    <div className="container">
      <h2>About Venom Ontology</h2>
      <h3>What is an ontology?</h3>
      <p>
        An ontology is a special kind of data structure that describes the <i>semantic meaning</i> of the concepts that are part of a particular domain. One of the key features of an ontology is that these meanings are represented (described) by links between the concepts in the ontology.
      </p>
      <p>
        Compare this to a <i>dictionary</i>: In a dictionary, words are defined using sentences that are easy for humans to read and understand, while in an ontology, links between related entities provide descriptions that are easy for computers to understand. In practice, we give names to these links that are meaningful to humans, so the relationships are also human readable.
      </p>
      <h3>What is Venom Ontology?</h3>
      <p>
        Venom Ontology is an ontology that describes the relationships between venoms, venom components, the species that produce these venoms, and the molecular and systemic effects that venoms and venom components have on the human body.
      </p>
      <p>
        Venom Ontology is used to provide a meaningful structure to the different data types (venoms, proteins, species, genomes, etc.) that are described in VenomKB. You can easily tell what ontology class each object in VenomKB is a member of by looking at the first letter of its VenomKB ID:
      </p>
      <ul>
        <li>Protein: "P"</li>
        <li>Species: "S"</li>
        <li>Venom: "V"</li>
        <li>Genome: "G"</li>
        <li>Molecular effect: "M"</li>
        <li>Systemic effect: "Y"</li>
      </ul>
      <p>
        For more information about Venom Ontology check out the original research article published at <a href="https://www.ncbi.nlm.nih.gov/pubmed/27570672">https://www.ncbi.nlm.nih.gov/pubmed/27570672</a>. You can also check it out (and download it) on BioPortal at <a href="https://bioportal.bioontology.org/ontologies/CU-VO">https://bioportal.bioontology.org/ontologies/CU-VO</a>.
      </p>
    </div>
  </div>;


export default AboutOntology;
