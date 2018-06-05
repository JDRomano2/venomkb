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
        this.rawOntologyClasses = [];
        this.constraints = [];
        this.ontologyClasses = {};

        // validate JSON (naive)
        if (!('select' in this.json)) {
            throw "Error: Semantic query must include \"select\" object.";
        }
    }

    static collectFromSelect(sel) {
        // Regardless of `sel`s actual type, we must return an Array
        switch (typeof sel) {
            case 'string':
                return [sel];
            case 'object':
                if (Array.isArray(sel)) {
                    // Array registers as Object when using typeof
                    return sel;
                }
                return Object.keys(sel);
            default:
                throw "Error---Type of \"select\" is not supported.";
        }
    }

    pushOntologyClassIfNotExist(newClass) {
        if (this.rawOntologyClasses.indexOf(newClass) === -1) {
            this.rawOntologyClasses.push(newClass);
        }
    }

    collectOntologyClasses() {
        // All keys of this.json["declare"] should be ontology classes
        if ("declare" in this.json) {
            Object.keys(this.json["declare"]).map((cl) => {
                this.pushOntologyClassIfNotExist(cl);
            });
        }

        // this.json["select"] is slightly more complex--it could be a string,
        // an array, or an object
        Query.collectFromSelect(this.json["select"]).map((sl) => {
            this.pushOntologyClassIfNotExist(sl);
        });
    }

    collectConstraints() {
        this.json["declare"].map((constr) => {
            this.constraints.push(constr);
        });
    }

    generateCypherQuery() {

    }

    logQuery() {
        console.log(JSON.stringify(this.json, null, 2));
    }

    buildSubgraph() {
        this.collectOntologyClasses();
        this.collectConstraints();

        this.generateCypherQuery();

        this.aggregate();
    }

    aggregate() {
        // TODO
    }
}


// Test the class out
const neo = new NeoAdapter(USER, PASSWORD);


const q1 = new Query(ex1);
q1.buildSubgraph();
console.log(q1['ontologyClasses']);
