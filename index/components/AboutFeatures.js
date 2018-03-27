import React from 'react';

const AboutFeatures = () =>
    <div className="jumbotron">
        <div className="container">
            <h2>Map of current and upcoming features</h2>
            <p>
                We are constantly working on adding new features to VenomKB. This page is meant to summarize the various features in VenomKB, as well as features that we are working on implementing in the near future.
            </p>
            <p>
                When we implement new features, we will also add an entry to the "News" panel on the home page. Check back frequently!
            </p>
            <h4> Color key:</h4>
            <ul>
                <li className="done">Currently implemented - green</li>
                <li className="inpr">Feature for next release - blue</li>
                <li className="todo">Planned feature - red</li>
            </ul>
            <div className="hr">
            </div>
            <h3>Website and data features</h3>
            <ul>
                <li>Species</li>
                <ul>
                    <li className="done">Taxonomy</li>
                    <li className="done">Known protein components</li>
                    <li className="done">Literature predications</li>
                </ul>
                <li>Proteins</li>
                <ul>
                    <li className="done">Source organism</li>
                    <li className="done">Free-text description (from ToxProt)</li>
                    <li className="done">Amino-acid sequence</li>
                    <li className="todo">DNA sequence</li>
                    <li className="done">External links to run BLAST</li>
                    <li className="done">Gene Ontology annotations</li>
                    <li className="done">Related publications</li>
                    <li className="done">Literature predications</li>
                    <li className="inpr">Links to external databases</li>
                    <li>Other molecular data (as available)</li>
                    <ul>
                        <li className="todo">IC<sub>50</sub> values</li>
                        <li className="todo">Binding target(s)</li>
                        <li className="todo">Protein isoforms in VenomKB</li>
                    </ul>
                </ul>
                <li>Genomes</li>
                <ul>
                    <li className="done">Link to species in VenomKB</li>
                    <li className="done">Link to sequencing project's homepage</li>
                </ul>
                <li>Functional genomics data (<a href="http://venomkb.org/about/venomseq">VenomSeq - click here for information</a>)</li>
                <ul>
                    <li className="todo">Venom expression profiles (normalized expression of all genes)</li>
                    <li className="todo">Venom expression signatures (top up/down regulated genes)</li>
                    <li className="todo">RNA-Seq/PLATE-Seq data of raw coutns</li>
                    <li className="todo">Human cell line information</li>
                    <li className="todo">Experimental conditions (per individual sample)</li>
                    <li className="todo">Most similar Connectivity Map perturbagens (using various similarity measures)</li>
                </ul>
                <li>Molecular effects of venoms</li>
                <li>Disease/condition-level effects of venoms</li>
                <ul>
                    <li className="inpr">Filter by effect on data search page</li>
                    <li className="todo">Incorporate data into protein/species pages</li>
                    <li className="todo"></li>
                </ul>
                <li>Miscellaneous</li>
                <ul>
                    <li className="done">Access to legacy VenomKB (v1.0)</li>
                    <li className="done">OWL ontology files</li>
                    <li className="todo">Website aggregate statistics</li>
                    <li className="inpr">Data provenance model</li>
                    <li className="todo">Graph view of data records in ontology hierarchy</li>
                </ul>
            </ul>
            <div className="hr">
            </div>
            <h3>API features</h3>
            <ul>
                <li>Basic API features</li>
                <ul>
                    <li className="done">Index of all records</li>
                    <li className="done">Fetch JSON data corresponding to a VKBID</li>
                    <li className="done">Fetch all JSON data for all records of a given data type</li>
                    <li className="todo">Search for matching JSON data in other fields (e.g., common name)</li>
                </ul>
                <li>Semantic querying engine</li>
                <ul>
                    <li className="todo">Graph representation of VenomKB data</li>
                    <li className="todo">Simple, high-level language for semantic queries</li>
                    <li className="todo">Ontological inference on graph database to run semantic queries</li>
                    <li className="todo">Full user documentation</li>
                </ul>
            </ul>
        </div>
    </div>;

export default AboutFeatures;
