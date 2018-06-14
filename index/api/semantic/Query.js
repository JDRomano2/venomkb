'use strict';

// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

const neo4j = require('../../../node_modules/neo4j-driver').v1

const USER = 'neo4j';
const PASSWORD = 'ooH77ZR4';
const URI = 'bolt://localhost:7687'

const examples = require("./examples");


class NeoAdapter {
    constructor(user, password) {
        this.user = user;
        this.password = password;

        this.driver = neo4j.driver(URI, neo4j.auth.basic(this.user, this.password));
        this.session = this.driver.session();
    }
}


class Query {
    constructor(query_json, neo4j_adapter) {
        this.json = query_json;
        this.neo4j_adapter = neo4j_adapter;
        this.ontologyClasses = [];
        this.constraints = [];

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
        if (this.ontologyClasses.indexOf(newClass) === -1) {
            this.ontologyClasses.push(newClass);
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
        // NOTE: This doesn't do everything we want it to yet!

        // Next, find any remaining ontology classes in this.json["aggregate"]
        // that we haven't yet encountered
        // TODO


    }

    /**
     *
     */
    collectConstraints() {
        // We just push each of the key-value pairs in this.json["declare"]
        // into this.constraints, meaning we have a list of constraints

        // This will require editing as we go along...
        Object.keys(this.json["declare"]).map((constr_key) => {
            this.constraints.push({constr_key: this.json["declare"][constr_key]})
        });
    }

    /**
     *
     * @memberof Query
     */
    buildMatch() {
        // This method looks at this.ontologyClasses and writes
        // a MATCH clause that contains a subgraph with each of these classes
        // included.
        return undefined;
    }

    /**
     *
     *  @memberof Query
     */
    buildReturn() {
        // Look at this.constraints and add all constraints that can be handled
        // by cypher into the text of a RETURN clause
        return undefined;
    }

    /**
     *
     *
     * @memberof Query
     */
    validateCypher() {

    }

    /**
     *
     *
     * @memberof Query
     */
    joinClauses() {
        // This is basically a string join operation, but we might run
        // into issues as we go
    }

    /**
     *
     *
     * @memberof Query
     */
    validateCypher() {
        // Deferring implementation until we have the other stuff working
    }

    /**
     *
     */
    generateCypherQuery() {
        // Cypher queries consist of two major components: a MATCH clause, and a
        // RETURN clause.
        this.buildMatch();
        this.buildReturn();

        this.joinClauses();

        // We also need to apply some validation to make sure that we've
        // constructed a valid cypher query.
        this.validateCypher();
    }

    /**
     * Writes the current query to stdout (server-side)
     */
    logQuery() {
        console.log(JSON.stringify(this.json, null, 2));
    }

    executeQuery() {
        return undefined;
    }

    finishAggregation() {
        // TODO
        return undefined;
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
    retrieveSubgraph() {
        // Determine the ontology classes spanning the subgraph
        this.collectOntologyClasses();
        // -> set ontologyClasses to ['Species', 'Protein']

        // Apply constraints to ontology classes when provided, such as
        // filtering by name
        this.collectConstraints();
        // -> set constraints to [{"Protein": {"name": {"contains": "Phospholipase"} } }]

        // Build a string corresponding to the cypher query
        // (Probably the most complicated method in this class)
        this.generateCypherQuery();

        // Run the query on the graph database
        // (utilizes adapter we previously specified)
        this.executeQuery();

        // Apply any final filtering steps or transformations that aren't yet
        // taken care of. We can build features into this as we encounter
        // scenarios that can't be handled by the cypher query alone.
        this.finishAggregation();
    }
}


// Test the class out
// const neo = new NeoAdapter(USER, PASSWORD);

// const q1 = new Query(examples.ex1, neo);

// q1.retrieveSubgraph();
// console.log(q1['ontologyClasses']);

module.exports = {
    NeoAdapter,
    Query
}