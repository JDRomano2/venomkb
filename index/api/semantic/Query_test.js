"use strict"

const chai = require('chai');
const expect = require('chai').expect;

const { NeoAdapter, Query } = require('./Query');
const examples = require('./examples');

const USER = 'neo4j';
const PASSWORD = 'ooH77ZR4';
const URI = 'bolt://localhost:7687'

const neo = new NeoAdapter(USER, PASSWORD);
const q1 = new Query(examples.ex1, neo);

q1.retrieveSubgraph();
console.log(q1['ontologyClasses']);

describe('Neo4j connection', () => {

});

describe('Example queries', () => {
    it("parses ontology classes correctly", (done) => {

    })
});

// Things we should test for:
// Each class attribute in Query (constraints, ontologyClasses, etc.) is valid
// Each method returns the correct type
// Each example executes