import React from 'react';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';

// Require static data files so Webpack knows to bundle them
require('../assets/data/semantic_vextractor.csv.zip');
require('../assets/data/manual_venoms.tsv.zip');
require('../assets/data/vextractor.csv.zip');

require('../assets/data/proteins_06272017.json.zip');
require('../assets/data/species_06272017.json.zip');
require('../assets/data/genomes_06272017.json.zip');
require('../assets/data/index_06272017.json.zip');

require('../assets/data/venom_ontology.xml.zip');

require('../assets/prov/venomkb.pn');

const vkb1_title = (
	<h3>VenomKB v1.0 data tables</h3>
);

const vkb2_title = (
	<h3>VenomKB v2.0 data tables</h3>
);

const vo_title = (
	<h3>Venom Ontology data tables</h3>
);

const prov_title = (
	<h3>VenomKB data provenance files</h3>
);

const Download = () =>
	<div className="jumbotron">
		<h2>Download</h2>

		<Panel header={vkb1_title} bsStyle="success">
			<div style={{display: 'flex', justifyContent: 'center'}}>
				<ButtonToolbar>
					<Button bsStyle="primary" href="vextractor.csv.zip">vextractor.csv</Button>
					<Button bsStyle="primary" href="semantic_vextractor.csv.zip">semantic_vextractor.csv</Button>
					<Button bsStyle="primary" href="manual_venoms.tsv.zip">manual_venoms.tsv</Button>
				</ButtonToolbar>
			</div>
		</Panel>

		<Panel header={vkb2_title} bsStyle="success">
			<div>
				<p><small>Last updated 06/27/2017:</small></p>
			</div>
			<div style={{display: 'flex', justifyContent: 'center'}}>

				<ButtonToolbar>
					<Button bsStyle="primary" href="proteins_06272017.json.zip">Proteins</Button>
					<Button bsStyle="primary" href="species_06272017.json.zip">Species</Button>
					<Button bsStyle="primary" href="genomes_06272017.json.zip">Genomes</Button>
					<Button bsStyle="primary" href="index_06272017.json.zip">Index</Button>
				</ButtonToolbar>
			</div>
		</Panel>

		<Panel header={vo_title} bsStyle="success">
			<div>
				<p><small>Last updated 06/27/2017:</small></p>
			</div>
			<div style={{display: 'flex', justifyContent: 'center'}}>
				<ButtonToolbar>
					<Button bsStyle="primary" href="venom_ontology.xml.zip">Venom Ontology (OWL XML)</Button>
				</ButtonToolbar>
			</div>
		</Panel>

		<Panel header={prov_title} bsStyle="success">
			<div>
				<p><small>Last updated 02/13/2018:</small></p>
			</div>
			<div style={{display: 'flex', justifyContent: 'center'}}>
				<ButtonToolbar>
					<Button bsStyle="primary" href="venomkb.pn">PROV-N</Button>
				</ButtonToolbar>
			</div>
		</Panel>
	</div>;


export default Download;
