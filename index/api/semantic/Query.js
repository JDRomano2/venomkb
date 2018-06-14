'use strict';

// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

const neo4j = require('../../../node_modules/neo4j-driver').v1

const USER = 'neo4j';
const PASSWORD = 'ooH77ZR4';
const URI = 'bolt://localhost:7687'

const ex1 = {
    "select": "Species",
    "declare": {
        "Protein": {
            "name": {"contains": "phospholipase"}
        }
    },
    "aggregate": {
        "count": "Species"
    }
}
// Ask: 'How many species have at least one protein with the word "Phospholipase" in its name?
//
// Query:
// MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
// WHERE p.name CONTAINS 'Phospholipase' OR p.name CONTAINS 'phospholipase'
// RETURN count(distinct s)
//
// Expect: '139'

const ex2 = {
    "select": "Species",
    "aggregate": {
        "count": "Protein",
        "sort": "desc",
        "limit": 1
    }
}
// Ask: 'What species has the most proteins?'
//
// Query:
// MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
// RETURN s.name, count(p) ORDER BY count(p) DESC LIMIT 1
//
// Expect: 'Haplopelma hainanum'

const ex3 = {
    "select": {"Species": "name"},
    "declare": {
        "Protein": {
            "name": {"contains": "Phospholipase A2"}
        }
    }
}
// Ask: 'Which species have a Phospholipase A2 in their venom?
//
// Query:
// MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
// WHERE p.name CONTAINS 'Phospholipase A2'
// RETURN s.name
//
// Expect: A list containing 81 species

const ex4 = {
    "select": "Pfam",
    "declare": {
        "Species": {
            "name": {"contains": "Conus"}
        }
    },
    "aggregate": {
        "distinct": "Pfam"
    }
}
// Ask: 'Which protein families are in venom of species in the genus Conus?'
//
// Query:
// MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[IS_A]->(f:Pfam)
// WHERE s.name CONTAINS 'Conus'
// RETURN DISTINCT f.name
//
// Expect: A list containing 24 Pfams


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

    /**
     *
     * @param {*} sel
     */
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

    /**
     *
     * @param {string} newClass Name of an ontology class
     */
    pushOntologyClassIfNotExist(newClass) {
        if (this.rawOntologyClasses.indexOf(newClass) === -1) {
            this.rawOntologyClasses.push(newClass);
        }
    }

    /**
     *
     */
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

    /**
     *
     */
    collectConstraints() {
        this.json["declare"].map((constr) => {
            this.constraints.push(constr);
        });
    }

    /**
     *
     */
    buildMatch() {

    }

    /**
     *
     */
    buildReturn() {

    }

    /**
     *
     */
    validateCypher() {

    }

    /**
     *
     */
    generateCypherQuery() {
        // Cypher queries consist of two major components: a MATCH clause, and a
        // RETURN clause.
        buildMatch();
        buildReturn();
        // We also need to apply some validation to make sure that we've
        // constructed a valid cypher query.
        validateCypher();
    }

    /**
     * Writes the current query to stdout (server-side)
     */
    logQuery() {
        console.log(JSON.stringify(this.json, null, 2));
    }

    /**
     * Top-level method that executes the major logical components of a semantic
     * API query.
     *
     * In this context, we are interested in finding a subgraph within the Neo4j
     * graph database corresponding to the user's query. Therefore, 'subgraph'
     * is synonymous with 'final result'
     *
     * A query must be stored in `this.json`, but this should be taken care of
     * by the constructor.
     */
    buildSubgraph() {
        // Determine the ontology classes spanning the subgraph
        this.collectOntologyClasses();

        // Apply constraints to ontology classes when provided, such as
        // filtering by name
        this.collectConstraints();

        // Build a string corresponding to the cypher query
        this.generateCypherQuery();

        // Run the query on the graph database
        this.executeQuery();

        // Apply any final filtering steps or transformations that aren't yet
        // taken care of
        this.finishAggregation();
    }

    finishAggregation() {
        // TODO
    }
}


// Test the class out
const neo = new NeoAdapter(USER, PASSWORD);


const q1 = new Query(ex1);
q1.buildSubgraph();
console.log(q1['ontologyClasses']);
