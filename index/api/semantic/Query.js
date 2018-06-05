'use strict';

// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

const neo4j = require('../../../node_modules/neo4j-driver').v1

const USER = 'neo4j';
const PASSWORD = 'ooH77ZR4';
const URI = 'bolt://localhost:7687'

const ex1 = {
    "declare": {
        "Protein": { "name": {"contains": "phospholipase"} }
    },
    "select": "Species",
    "aggregate": { "count": "Species" }
}


class NeoAdapter {
    constructor(user, password) {
        this.user = user;
        this.password = password;

        this.driver = neo4j.driver(URI, neo4j.auth.basic(this.user, this.password));
        this.session = this.driver.session();


    }
}


class Query {
    constructor(query_json) {
        this.json = query_json;
    }

    printQuery() {
        console.log(JSON.stringify(this.json, null, 2));
    }

    buildSubgraph() {
        // TODO
    }

    selectData() {
        // TODO
    }

    aggregate() {
        // TODO
    }
}


// Test the class out
const q1 = new Query(ex1);
q1.printQuery();
//console.log(JSON.stringify(q1.json["declare"]["Protein"]));

const neo = new NeoAdapter(USER, PASSWORD);
