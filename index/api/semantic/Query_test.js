"use strict"

const chai = require('chai');
const expect = require('chai').expect;

const { NeoAdapter, Query } = require('./Query');
const examples = require('./examples');

const USER = 'neo4j';
const PASSWORD = 'Gazaupouy12!';
const URI = 'bolt://localhost:7687'

const neo = new NeoAdapter(USER, PASSWORD);
const q1 = new Query(examples.ex1, neo);
// const q2 = new Query(examples.ex2, neo);
// const q3 = new Query(examples.ex3, neo);
// const q4 = new Query(examples.ex4, neo);

q1.retrieveSubgraph();
// q2.retrieveSubgraph();
// q3.retrieveSubgraph();
// q4.retrieveSubgraph();

describe('Neo4j connection', () => {

});

describe('Initialize query', () => {
	it("Should check the type of Query properties", (done) => {
		expect(q1['ontologyClasses']).to.be.a("Array")
		expect(q2['ontologyClasses']).to.be.a("Array")
		expect(q3['ontologyClasses']).to.be.a("Array")
		expect(q4['ontologyClasses']).to.be.a("Array")

		expect(q1['constraints']).to.be.a("Array")
		expect(q2['constraints']).to.be.a("Array")
		expect(q3['constraints']).to.be.a("Array")
		expect(q4['constraints']).to.be.a("Array")
	
        done()
	})
    it("Should parses ontology classes correctly", (done) => {
		expect(q1['ontologyClasses']).to.eql(['Protein', 'Species'])
		expect(q2['ontologyClasses']).to.eql(["Species", "Protein"])
		expect(q3['ontologyClasses']).to.eql(["Protein","Species"])
		expect(q4['ontologyClasses']).to.eql(["Species", "Pfam"])
        done()
    })
    it("Should parses constraints correctly", (done) => {
		expect(q1['constraints'].length).to.equal(1)
		expect(q1['constraints'][0]).to.eql({class:"Protein", attribute:"name", operator:"contains", value:"phospholipase"})
		
		expect(q2['constraints'].length).to.equal(0)
		
		expect(q3['constraints'].length).to.equal(1)
		expect(q3['constraints'][0]).to.eql({class:"Protein", attribute:"name", operator:"contains", value:"Phospholipase A2"})

		expect(q4['constraints'].length).to.equal(1)
		expect(q4['constraints'][0]).to.eql({class:"Species", attribute:"name", operator:"contains", value:"Conus"})

        done()
    })
});

describe('Test generate cypher query', () => {
	it('Should build a match string', (done) => {
		expect(q1["query_match"]).to.equal("MATCH (p:Protein)-[:PROTEIN_FROM_SPECIES]->(s:Species)  WHERE p.name contains 'phospholipase'")
		expect(q2["query_match"]).to.equal("MATCH (s:Species)-[: SPECIES_HAS_PROTEIN]->(p:Protein)")
		expect(q3["query_match"]).to.equal("MATCH (p:Protein)-[:PROTEIN_FROM_SPECIES]->(s:Species) WHERE p.name contains 'Phospholipase A2'")
		done()
	})
})

describe('Second example', () => {
	it('Should build a match string', (done) => {
		expect(q1["query_match"]).to.equal("MATCH(s: Species) - [: SPECIES_HAS_PROTEIN] -> (p: Protein)")
		expect(q1["query_match"]).to.equal("RETURN count(distinct s)")
		done()
	})
})


// Things we should test for:
// Each class attribute in Query (constraints, ontologyClasses, etc.) is valid
// Each method returns the correct type
// Each example executes