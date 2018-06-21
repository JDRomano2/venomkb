'use strict';

// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

const neo4j = require('../../../node_modules/neo4j-driver').v1

const USER = 'neo4j';
const PASSWORD = 'Gazaupouy12!';
const URI = 'bolt://localhost:7687'

const examples = require("./examples");
let item = {
    Protein: "p",
    Species: "s",
    Pfam: "f",
    SystemicEffect: "se",
    OntologyClass: "c",
    Genome: "g"
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
    constructor(query_json, neo4j_adapter) {
        this.json = query_json;
        this.neo4j_adapter = neo4j_adapter;
        this.ontologyClasses = [];
        this.constraints = [];

        // just for dev 
        this.query_match = "";
        this.relationship = [];

        // {
        //     "class": "Protein",
        //     "attribute": "name",
        //     "operator": "contains",
        //     "value": "Phospholipase"
        // }

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
     * @param {*} json
     */
    static validateUserInput(json) {
        validateJsonSchema(json);
        validateSemantics(json);
    }

    static validateJsonSchema(json) {
        // Todo
    }

    static validateSemantics(json) {
        // Todo
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
        if ("aggregate" in this.json) {
            if ("count" in this.json["aggregate"])
                this.pushOntologyClassIfNotExist(this.json["aggregate"]["count"])
        }
    }

    /**
     *
     */
    collectConstraints() {
        // We just push each of the key-value pairs in this.json["declare"]
        // into this.constraints, meaning we have a list of constraints

        // This will require editing as we go along...
        if ("declare" in this.json) {
            var object = this.json["declare"][Object.keys(this.json["declare"])][0]
            var new_constraint = {
                class: Object.keys(this.json["declare"])[0],
                attribute: object.attribute,
                operator: object.operator,
                value: object.value,

            }
            this.constraints.push(new_constraint)
        }
    }

    /**
    *
    * @memberof Query
    */
    findDirectRelation() {
        const session = this.neo4j_adapter.session
        const driver = this.neo4j_adapter.driver

        if (this.ontologyClasses.length == 2) {

            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]
            // case of direct relation ship 
            const query_relation = "MATCH (" + item[class1] + ": " + class1 + ")-[r]->(" + item[class2] + ": " + class2 + ") return distinct(type(r))"
            const resultPromise = session.writeTransaction(tx => tx.run(
                query_relation));

            // console.log(query_relation);

            return resultPromise
        }
    }

    /**
    *
    * @memberof Query
    */
    async findShortestPath() {
        const session = this.neo4j_adapter.session
        const driver = this.neo4j_adapter.driver

        if (this.ontologyClasses.length == 2) {
            console.log("entrer find path");
            
            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]
            // case of direct relation ship 
            const query_relation = "MATCH(c1: OntologyClass { name: '"+class1+"'}), (c2: OntologyClass { name: '"+ class2+ "'}), p = shortestPath((c1) - [*] - (c2)) RETURN p"
            
            const resultPromise = session.writeTransaction(tx => tx.run(
                query_relation));
                
                // console.log(query_relation);
                
                console.log("query relation", query_relation);
            return resultPromise
        }
    }

    /**
    *
    * @memberof Query
    */
    async findMultipleRelation(result) {
        var result_object = result.records[0].toObject()
        var path_global = result_object.p.segments
        
        for (let i = 0; i < result_object.p.length; i++) {
            this.relationship.push([
                result_object.p.segments[i].start.properties.name,
                result_object.p.segments[i].relationship.type,
                result_object.p.segments[i].end.properties.name
            ])
        }
    }

    /**
     *
     * @memberof Query
     */
    async buildMatch() {
        // This method looks at this.ontologyClasses and writes
        // a MATCH clause that contains a subgraph with each of these classes
        // included.

        const class1 = this.ontologyClasses[0]
        const class2 = this.ontologyClasses[1]
        
        // var result = await this.findDirectRelation()
        
        var result = await this.findShortestPath()
        var tables_relationship = await this.findMultipleRelation(result)
        console.log(this.relationship);
        
       
            
        if (false) {
            const singleRecord = result.records[0]
            const relationship = singleRecord.get(0);

            
            const query_match = "MATCH (" + item[class1] + ":" + class1 + ")-[:" + relationship + "]->(" + item[class2] + ":" + class2 +") "
            
            
        }

            if (this["constraints"].length>0) {
                const constraint = this["constraints"][0]
                
                const query_where = "WHERE " + item[constraint.class] + "." + constraint["attribute"] +" "+constraint["operator"]+" '"+constraint["value"]+"'"
                
                // on application exit:
                console.log(query_match + query_where);
                this.query_match = query_match+ query_where
                return Promise.resolve(query_match + query_where);
                
            }
            this.query_match = query_match

            return Promise.resolve(query_match );
    }
    
    /**
     *
     *  @memberof Query
     */
    buildReturn() {
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
    async generateCypherQuery() {
        // Cypher queries consist of two major components: a MATCH clause, and a
        // RETURN clause.
        var query_match = await this.buildMatch();
        console.log("hehehfzbdjeffnenfce", query_match);
        
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
const neo = new NeoAdapter(USER, PASSWORD);

const q1 = new Query(examples.ex1, neo);

q1.retrieveSubgraph();
console.log(q1['ontologyClasses']);
// console.log(q1['neo4j_adapter']['session']);

module.exports = {
    NeoAdapter,
    Query
}