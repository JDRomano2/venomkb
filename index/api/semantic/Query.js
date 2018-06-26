'use strict';

// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

const neo4j = require('../../../node_modules/neo4j-driver').v1
const { USER, PASSWORD, URI } = require('./semantic.cfg');

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
    constructor(user, password, uri) {
        this.user = user;
        this.password = password;

        this.driver = neo4j.driver(uri, neo4j.auth.basic(this.user, this.password));
        // this.session = this.driver.session();
    }
}




class Query {
    constructor(query_json, neo4j_adapter) {
        this.json = query_json;
        this.neo4j_adapter = neo4j_adapter;
        this.session = this.neo4j_adapter.driver.session();
        this.ontologyClasses = [];
        this.constraints = [];

        // just for dev
        this.query_match = ""
        this.query_where = ""
        this.query_return = ""
        this.query = ""
        this.relationship = [];
        this.select = [];
        this.result = []
        this.expect = []

        //for validation 
        this.properties = []

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
    * @memberof Query
    */
    async findPropertyKeys() {
        const query = "CALL db.propertyKeys()"
        const resultPromise = this.session.writeTransaction(tx => tx.run(
                query));
            return resultPromise
    }


    /**
    *
    * @memberof Query
    */
    async treatPropertyKeys(result) {

        var result_object = result.records
        for (let element of result_object) {
            var res = element.toObject()
            this.properties.push(res["propertyKey"])
            
        }
        return Promise.resolve(this.properties)
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
    async collectOntologyClasses() {
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
    async collectConstraints() {
        // We just push each of the key-value pairs in this.json["declare"]
        // into this.constraints, meaning we have a list of constraints

        // This will require editing as we go along...
        if ("declare" in this.json) {
            var classes = Object.keys(this.json["declare"])
            for (let ontology of classes) {
                const object = this.json["declare"][ontology][0]

                var new_constraint = {
                    class: ontology,
                    attribute: object.attribute,
                    operator: object.operator,
                    value: object.value,

                }
                this.constraints.push(new_constraint)

            }
        }
    }

    /**
     *
     */
    async collectSelect() {
        if (typeof this.json.select == "string") {

            var object = this.json.select

            var obj = {}
            if (this.json.aggregate && Object.values(this.json.aggregate).indexOf(object) != -1 ) {
                obj[object] = null;
                this.select.push(obj)
            }
            else {
                obj[object] = [];
                this.select.push(obj)
            }
        }
        if (this.json.select.constructor === Array) {
            this.json.select.forEach(element => {
                if (typeof this.json.select == "string") {
                    var object = this.json.select
                    var obj = {}
                    if (Object.values(this.json.aggregate).indexOf(object) != -1) {
                        var obj = {};
                        obj[object] = null;
                        this.select.push(obj)
                    }
                    else {
                        var obj = {};
                        obj[object] = [];
                        this.select.push(obj)
                    }
                }
                if (typeof this.json.select == "object") {
                    var object = Object.keys(this.json.select)[0]
                    var obj = {};
                    obj[object] = [this.json.select[object]];
                    this.select.push(obj)

                }
            });

        }
        if (typeof this.json.select == "object") {
            var object = Object.keys(this.json.select)[0]
            var obj = {};
            obj[object] = [this.json.select[object]];
            this.select.push(obj)
        }

    }


    /**
    *
    * @memberof Query
    */
    async findDirectRelation() {
        // const session = this.neo4j_adapter.session
        // const driver = this.neo4j_adapter.driver

        if (this.ontologyClasses.length == 2) {

            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]
            // case of direct relation ship
            const query_relation = "MATCH (" + item[class1] + ": " + class1 + ")-[r]->(" + item[class2] + ": " + class2 + ") return distinct(type(r))"
            const resultPromise = this.session.writeTransaction(tx => tx.run(
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
        // const session = this.neo4j_adapter.session
        // const driver = this.neo4j_adapter.driver

        if (this.ontologyClasses.length == 2) {

            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]
            // case of direct relation ship
            const query_relation = "MATCH(c1: OntologyClass { name: '"+class1+"'}), (c2: OntologyClass { name: '"+ class2+ "'}), p = shortestPath((c1) - [*] -> (c2)) RETURN p"

            // Error: Neo4jError; can't begin a txn on session with open txn
            const resultPromise = this.session.writeTransaction(tx => tx.run(
                query_relation));

                // console.log(query_relation);

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
    async buildQueryMatch() {
        var query_match ="MATCH "

        var class1 = this.relationship[0][0]
        var class2 = this.relationship[0][2]
        var rel = this.relationship[0][1]
        query_match += "("+item[class1]+":"+class1+")-[:"+rel+"]->("+item[class2]+":"+class2+")"

        for (let i = 1; i < this.relationship.length; i++) {
            var class2 = this.relationship[i][2]
            var rel = this.relationship[i][1]
            query_match += "-[:" + rel + "]->(" + item[class2] + ":" + class2 + ")"

        }
        this.query_match = query_match
        return Promise.resolve(this.query_match);

    }

    /**
    *
    * @memberof Query
    */
    async buildQueryWhere() {
        // console.log("enter build where", this.constraints);

        const constraint = this["constraints"][0]
        if (constraint.operator == "equals") {
            constraint.operator = "="
        }
        this.query_where = "WHERE " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'"
        
        for (let i = 1; i < this.constraints.length; i++) {
            const constraint = this["constraints"][i]
            if (constraint.operator == "equals") {
                constraint.operator = "="
            }
            this.query_where += " and " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'"

            
        }
        this.query_where += " "
        return Promise.resolve(this.query_where);
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
        var query_match = await this.buildQueryMatch()

        if (this.constraints.length>0) {
            var query_where = await this.buildQueryWhere()
        }
        else {
            var query_where = ""
        }


        return Promise.resolve(query_match + query_where );
    }

    /**
     *
     *  @memberof Query
     */
    async buildReturn() {
        // console.log("enter build return", this.json.aggregate);
        const aggregate = this.json.aggregate
        const ontology = Object.keys(this.select[0])[0]
        const value = this.select[0][ontology]

        this.query_return = "RETURN "

        if (value == null) {
            if ("count" in aggregate) {
                this.query_return += "COUNT ("
            }

            if ("distinct" in aggregate) {
                this.query_return += "DISTINCT "
            }

            this.query_return += item[this.json.select]

            if ("count" in aggregate) {
                this.query_return += ")"
            }
        }

        else if (value.length>0) {
            this.query_return += item[ontology]+"."+value[0]
        }

        else{
            this.query_return += item[ontology] 
            if (aggregate) {
                if ("count" in aggregate) {
                    this.query_return += ", COUNT ("
                    if ("distinct" in aggregate) {
                        this.query_return += "DISTINCT "
                    }
                    // if (attribut.included(aggregate.distinct)) {
                        
                    // }
                    this.query_return += item[aggregate.count] +")"
                    if ("sort" in aggregate) {
                        this.query_return += " ORDER BY count(" + item[aggregate.count] + ") "+aggregate["sort"]+" "
                    }
                }

                else if ("distinct" in aggregate) {
                   this.query_return = "RETURN DISTINCT "
                   this.query_return += item[ontology]
                }

                if ("limit" in aggregate) {
                    this.query_return += "LIMIT "+ aggregate.limit
                }

            }

        }
        return Promise.resolve(this.query_return);
    }



    /**
     *
     *
     * @memberof Query
     */
    joinClauses() {
        this.query = this.query_match + this.query_where + this.query_return
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
        var query_match = await this.buildMatch(); // includes WHERE clause, if needed

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

    async executeQuery() {
        const resultPromise = this.session.writeTransaction(tx => tx.run(this.query));
        return resultPromise
    }



    /**
    *
    * @memberof Query
    */
    async treatResult(result) {
        for (let i in result.records) {
            var result_tpm = result.records[i]
            
            var result_object = result_tpm.toObject()
            var keys = Object.keys(result_object)
            // console.log(keys);
            // console.log(result_object);
            
            
            
            for (let k in keys) {
                // var res = result_object[key]
                
                const ontology_classe = Object.values(item)
                const key = keys[k]
                const element = result_object[key]
                
                
                if (key.includes(".")) {
                    const element_complete = key.split(".");
                    
                    const attribut = element_complete[1]
                    const value = element
                    var temp = {}
                    temp[attribut] = value;
                    this.result.push(temp)
                }
    
                else if (ontology_classe.includes(key)) {
                    if (element.properties.score) {
                        
                        if (element.properties.score.low != 0 ) {
                            element.properties.score = element.properties.score.low
                        }
                        else {
                            element.properties.score = element.properties.score.high
                        }
                    }
                    this.result.push(element.properties )
                }
    
                if (key.includes("COUNT")) {
                    if (element["low"] != 0) {
                        this.result.push({"count": element["low"]})
                    }
                    else {
                        this.result.push({"count": result_object[key]["high"]})
                    }
                    
                }
            
        }
                
        }
        console.log("\n\n resultat", this.result);
        
        return Promise.resolve(this.result)
        
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
    async retrieveSubgraph() {
        // Determine the ontology classes spanning the subgraph
        var result = await this.findPropertyKeys()
        await this.treatPropertyKeys(result)
        // console.log(this.properties);
        
        this.collectOntologyClasses();
        // -> set ontologyClasses to ['Species', 'Protein']

        // Apply constraints to ontology classes when provided, such as
        // filtering by name
        this.collectConstraints();
        // -> set constraints to [{"Protein": {"name": {"contains": "Phospholipase"} } }]

        // Determine what should be return
        this.collectSelect();
        // -> set select to [[Species, complete], [Protein, name]]

        // Build a string corresponding to the cypher query
        // (Probably the most complicated method in this class)
        await this.generateCypherQuery();
        console.log("\n\n", this.query);
        
        // console.log("\n\n");
        // console.log("relation", this.relationship);
        // console.log(this.query_match, this.query_where);
        // console.log(this.query_return);

        // Run the query on the graph database
        // (utilizes adapter we previously specified)
        var result = await this.executeQuery();
        this.treatResult(result)
        // console.log("\n\n");
        // console.log("resultat", this.result);
        // Apply any final filtering steps or transformations that aren't yet
        // taken care of. We can build features into this as we encounter
        // scenarios that can't be handled by the cypher query alone.
        this.finishAggregation();
    }
}


// Test the class out
const neo = new NeoAdapter(USER, PASSWORD, URI);

const q7 = new Query(examples.ex7, neo);

q7.retrieveSubgraph();
// console.log("TESTTTTTTT", q6['relationship']);
// console.log("TESTTTTTTT", q1['query_match']);
// console.log("TESTTTTTTT", q1['query_where']);
// console.log(q1['neo4j_adapter']['session']);

module.exports = {
    NeoAdapter,
    Query
}