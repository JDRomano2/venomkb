"use strict"

// NOTE: You must create a config file named 'semantic.cfg.js' in this
// directory. The format of this file looks like the following:

// module.exports = {
// 	 USER: 'user',
// 	 PASSWORD: 'password',
// 	 URI: 'bolt'
// }

const chai = require('chai');
const expect = require('chai').expect;

const { NeoAdapter, Query } = require('./Query');
const examples = require('./examples');
const { USER, PASSWORD, URI } = require('./semantic.cfg');

const neo = new NeoAdapter(USER, PASSWORD, URI);
const q1 = new Query(examples.ex1, neo);
const q2 = new Query(examples.ex2, neo);
const q3 = new Query(examples.ex3, neo);
const q4 = new Query(examples.ex4, neo);
const q5 = new Query(examples.ex5, neo);
const q6 = new Query(examples.ex6, neo);
const q7 = new Query(examples.ex7, neo);
const q8 = new Query(examples.ex8, neo);


async function initializeTest() {
	await q1.retrieveSubgraph();
	await q2.retrieveSubgraph();
	await q3.retrieveSubgraph();
	await q4.retrieveSubgraph();
	await q5.retrieveSubgraph();
	await q6.retrieveSubgraph();
	await q7.retrieveSubgraph();
	await q8.retrieveSubgraph();
	return Promise.resolve(0)
}


describe('Neo4j connection', () => {
	it("Should initialize the test", (done) => {
		initializeTest().then(status => {
			expect(status).to.equals(0);
			done()
		}).catch((err) => {
			done(err);
		})
	})
});

describe('Initialize query', () => {
	it("Should check the type of Query properties", (done) => {
		expect(q1['ontologyClasses']).to.be.a("Array")
		expect(q2['ontologyClasses']).to.be.a("Array")
		expect(q3['ontologyClasses']).to.be.a("Array")
		expect(q4['ontologyClasses']).to.be.a("Array")
		expect(q5['ontologyClasses']).to.be.a("Array")
		expect(q6['ontologyClasses']).to.be.a("Array")
		expect(q7['ontologyClasses']).to.be.a("Array")
		expect(q8['ontologyClasses']).to.be.a("Array")

		expect(q1['constraints']).to.be.a("Array")
		expect(q2['constraints']).to.be.a("Array")
		expect(q3['constraints']).to.be.a("Array")
		expect(q4['constraints']).to.be.a("Array")
		expect(q5['constraints']).to.be.a("Array")
		expect(q6['constraints']).to.be.a("Array")
		expect(q7['constraints']).to.be.a("Array")
		expect(q8['constraints']).to.be.a("Array")

        done()
	})
    it("Should parse ontology classes correctly", (done) => {
		expect(q1['ontologyClasses']).to.include('Protein', 'Species')
		expect(q2['ontologyClasses']).to.include('Protein', 'Species')
		expect(q3['ontologyClasses']).to.include('Protein', 'Species')
		expect(q4['ontologyClasses']).to.include("Species", "Pfam")
		expect(q5['ontologyClasses']).to.include("Species", "Pfam")
		expect(q6['ontologyClasses']).to.include("Species", "Pfam")
		expect(q7['ontologyClasses']).to.include("Species", "SystemicEffect")
		expect(q8['ontologyClasses']).to.include("Species", "Protein", "SystemicEffect")
        done()
    })
    it("Should parse constraints correctly", (done) => {
		expect(q1['constraints'].length).to.equal(1)
		expect(q1['constraints'][0]).to.eql({class:"Protein", attribute:"name", operator:"contains", value:"phospholipase"})

		expect(q2['constraints'].length).to.equal(0)

		expect(q3['constraints'].length).to.equal(1)
		expect(q3['constraints'][0]).to.eql({class:"Protein", attribute:"name", operator:"contains", value:"Phospholipase A2"})

		expect(q4['constraints'].length).to.equal(1)
		expect(q4['constraints'][0]).to.eql({class:"Species", attribute:"name", operator:"contains", value:"Conus"})

		expect(q5['constraints'].length).to.equal(1)
		expect(q5['constraints'][0]).to.eql({ class: "Species", attribute: "name", operator: "=", value: "Crotalus adamanteus" })

		expect(q6['constraints'].length).to.equal(1)
		expect(q6['constraints'][0]).to.eql({ class: "Pfam", attribute: "name", operator: "=", value: "Reprolysin" })

		expect(q7['constraints'].length).to.equal(2)
		expect(q7['constraints'][0]).to.eql({ class: "Species", attribute: "name", operator: "contains", value: "Conus" })
		expect(q7['constraints'][1]).to.eql({ class: "SystemicEffect", attribute: "name", operator: "=", value: "Neuralgia" })

		expect(q8['constraints'].length).to.equal(1)
		expect(q8['constraints'][0]).to.eql({ class: "SystemicEffect", attribute: "name", operator: "equals", value: "Osteosarcoma" })

        done()
	})
	it("Should parse select correctly", (done) => {
		expect(q1['select'].length).to.equal(1)
		expect(q1['select']).to.eql([{"Species": null}])

		expect(q2['select'].length).to.equal(1)
		expect(q2['select']).to.eql([{"Species": []}])


		expect(q3['select'].length).to.equal(1)
		expect(q3['select']).to.eql([{ "Species": ["name"] }])

		expect(q4['select'].length).to.equal(1)
		expect(q4['select']).to.eql([{"Pfam": null}])

		expect(q5['select'].length).to.equal(1)
		expect(q5['select']).to.eql([{ "Pfam": [] }])

		expect(q6['select'].length).to.equal(1)
		expect(q6['select']).to.eql([{ "Species": null }])

		expect(q7['select'].length).to.equal(1)
		expect(q7['select']).to.eql([{ "Species": []}])

		expect(q8['select'].length).to.equal(2)
		expect(q8['select']).to.eql([{ "Species": ["name"] }, { "Protein": [] }])

		done()
	})
});

describe('Test generate cypher query', () => {
	it('Should build a table of relationship', (done) => {
		expect(q1['relationship'].length).to.equal(1)
		expect(q1["relationship"][0]).to.include.ordered.members(['Protein', "PROTEIN_FROM_SPECIES", "Species"])

		expect(q2['relationship'].length).to.equal(1)
		expect(q2["relationship"][0]).to.include.ordered.members(['Species', 'SPECIES_HAS_PROTEIN', 'Protein'])

		expect(q3['relationship'].length).to.equal(1)
		expect(q3["relationship"][0]).to.include.ordered.members(['Protein', 'PROTEIN_FROM_SPECIES', 'Species'])

		expect(q4['relationship'].length).to.equal(2)
		expect(q4["relationship"][0]).to.include.ordered.members(['Species', 'SPECIES_HAS_PROTEIN', 'Protein'], ['Protein', 'IS_A', 'Pfam'])
		
		expect(q5['relationship'].length).to.equal(2)
		expect(q5["relationship"][0]).to.include.ordered.members(['Species', 'SPECIES_HAS_PROTEIN', 'Protein'], ['Protein', 'IN_FAMILY', 'Pfam'])

		expect(q6['relationship'].length).to.equal(2)
		expect(q6["relationship"][0]).to.include.ordered.members(['Pfam', 'CONTAINS_PROTEIN', 'Protein'], ['Protein', 'PROTEIN_FROM_SPECIES', 'Species'])

		expect(q7['relationship'].length).to.equal(2)
		expect(q7["relationship"][0]).to.include.ordered.members(['Species', 'SPECIES_HAS_PROTEIN', 'Protein'], ['Protein', 'INFLUENCES_SYSTEMIC_EFFECT', 'SystemicEffect'])

		expect(q8['relationship'].length).to.equal(2)
		expect(q8["relationship"][0]).to.include.ordered.members(['Species', 'SPECIES_HAS_PROTEIN', 'Protein'], ['Protein', 'INFLUENCES_SYSTEMIC_EFFECT', 'SystemicEffect'])

		done()
	})
	it('Should build a match string', (done) => {
		expect(q1["query_match"]).to.equal("MATCH (p:Protein)-[:PROTEIN_FROM_SPECIES]->(s:Species)")
		expect(q2["query_match"]).to.equal("MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)")
		expect(q3["query_match"]).to.equal("MATCH (p:Protein)-[:PROTEIN_FROM_SPECIES]->(s:Species)")
		expect(q4["query_match"]).to.equal("MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)-[:IN_FAMILY]->(f:Pfam)")
		expect(q5["query_match"]).to.equal("MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)-[:IN_FAMILY]->(f:Pfam)")
		expect(q6["query_match"]).to.equal("MATCH (f:Pfam)-[:CONTAINS_PROTEIN]->(p:Protein)-[:PROTEIN_FROM_SPECIES]->(s:Species)")
		expect(q7["query_match"]).to.equal("MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)-[:INFLUENCES_SYSTEMIC_EFFECT]->(se:SystemicEffect)")
		expect(q8["query_match"]).to.equal("MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)-[:INFLUENCES_SYSTEMIC_EFFECT]->(se:SystemicEffect)")
		done()
	})
	it('Should build a where string', (done) => {
		expect(q1["query_where"]).to.equal("WHERE p.name contains 'phospholipase' ")
		expect(q2["query_where"]).to.equal("")
		expect(q3["query_where"]).to.equal("WHERE p.name contains 'Phospholipase A2' ")
		expect(q4["query_where"]).to.equal("WHERE s.name contains 'Conus' ")
		expect(q5["query_where"]).to.equal("WHERE s.name = 'Crotalus adamanteus' ")
		expect(q6["query_where"]).to.equal("WHERE f.name = 'Reprolysin' ")
		expect(q7["query_where"]).to.equal("WHERE s.name contains 'Conus' and se.name = 'Neuralgia' ")
		expect(q8["query_where"]).to.equal("WHERE e.name = 'Osteosarcoma' ")
		done()
	})
	it('Should build a return string', (done) => {
		expect(q1["query_return"]).to.equal("RETURN COUNT (DISTINCT s)")
		expect(q2["query_return"]).to.equal("RETURN s, COUNT (p) ORDER BY count(p) desc LIMIT 1")
		expect(q3["query_return"]).to.equal("RETURN s.name")
		expect(q4["query_return"]).to.equal("RETURN DISTINCT f.name")
		expect(q5["query_return"]).to.equal("RETURN f")
		expect(q6["query_return"]).to.equal("RETURN DISTINCT s.name")
		expect(q7["query_return"]).to.equal("RETURN s")
		expect(q8["query_return"]).to.equal("RETURN DISTINCT s.name, p")
		done()
	})
	it('Should return a correct answer', (done) => {
		expect(q1["result"].length).to.equal(1)
		expect(q1["result"][0]).to.include({"count" : 125})

		expect(q2["result"].length).to.equal(2)
		expect(q2["result"][0]).to.include({ vkbid: 'S8831072', name: 'Haplopelma hainanum', score: 5 })
		expect(q2["result"][1]).to.include({ count: 292 })
		
		expect(q3["result"].length).to.equal(81)
		
		expect(q4["result"].length).to.equal(20)
		expect(q5["result"].length).to.equal(42)
		expect(q6["result"].length).to.equal(57)
		expect(q7["result"].length).to.equal(4)
		expect(q8["result"].length).to.equal(2)
		done()
	})
})




// Things we should test for:
// Each class attribute in Query (constraints, ontologyClasses, etc.) is valid
// Each method returns the correct type
// Each example executes