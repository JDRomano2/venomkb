"use strict";
// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_module = __importStar(require("neo4j-driver"));
const examples = __importStar(require("./examples"));
let item = {
    Protein: "p",
    Species: "s",
    Pfam: "f",
    SystemicEffect: "se",
    OntologyClass: "c",
    Genome: "g"
};
var ontology;
(function (ontology) {
    ontology["OntologyClass"] = "OntologyClass";
    ontology["Protein"] = "Protein";
    ontology["Pfam"] = "Pfam";
    ontology["Species"] = "Species";
    ontology["Genome"] = "Genome";
    ontology["SystemicEffect"] = "SystemicEffect";
})(ontology || (ontology = {}));
var properties;
(function (properties) {
    properties["name"] = "name";
    properties["venomkb_id"] = "venomkb_id";
    properties["score"] = "score";
    properties["UniProtKB_id"] = "UniProtKB_id";
    properties["aa_sequence"] = "aa_sequence";
})(properties || (properties = {}));
class NeoAdapter {
    constructor(user, password, uri) {
        this.user = user;
        this.password = password;
        this.uri = "";
        this.driver = neo4j_module.v1.driver(uri, neo4j_module.v1.auth.basic(this.user, this.password));
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
        this.query_match = "";
        this.query_where = "";
        this.query_return = "";
        this.query = "";
        this.relationship = [];
        this.select = [];
        this.result = [];
        //for validation 
        this.properties = [];
        this.ontology = [];
        // validate JSON (naive)
        if (!('select' in this.json)) {
            throw "Error: Semantic query must include \"select\" object.";
        }
    }
    /**
    *
    * @memberof Query
    */
    async findPropertyKeys() {
        const query = "CALL db.propertyKeys()";
        const resultPromise = await this.session.writeTransaction(tx => tx.run(query));
        return resultPromise;
    }
    async findOntologyClasses() {
        const query = "CALL db.labels()";
        const resultPromise = await this.session.writeTransaction(tx => tx.run(query));
        return resultPromise;
    }
    /**
    *
    * @memberof Query
    */
    treatPropertyKeys(result) {
        var result_object = result.records;
        for (let element of result_object) {
            var res = element.toObject();
            this.properties.push(res["propertyKey"]);
        }
    }
    treatontologyClasses(result) {
        var result_object = result.records;
        for (let element of result_object) {
            var res = element.toObject();
            this.ontology.push(res["label"]);
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
    valideJson(json) {
        const categories = ["select", "declare", "aggregate", "post_treatment"];
        const aggregates_valid = ["count", "distinct", "order", "limit"];
        const element = Object.keys(json);
        if (element.indexOf("select") == -1) {
            console.log("There is no select in the json");
            return false;
        }
        for (let elt of element) {
            if (!categories.includes(elt)) {
                console.log("Not valid key in Json : " + elt);
                return false;
            }
        }
        if (json.aggregate) {
            const keys = Object.keys(json.aggregate);
            for (let key of keys) {
                if (!aggregates_valid.includes(key)) {
                    console.log("Not valid key in Json.aggregate : " + key);
                    return false;
                }
            }
        }
        return true;
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
        if (this.json.declare) {
            var keys = Object.keys(this.json.declare);
            for (let key of keys) {
                this.pushOntologyClassIfNotExist(key);
            }
        }
        // this.json["aggregate"] can be an object or an array,  in count or disctinct can contain ontology class
        if (this.json.aggregate) {
            if (this.json.aggregate.count)
                this.pushOntologyClassIfNotExist(this.json.aggregate.count.class);
            if (this.json.aggregate.distinct)
                this.pushOntologyClassIfNotExist(this.json.aggregate.distinct.class);
        }
        // this.json["select"] is slightly more complex--it could be a string,
        // an array, or an object
        if (typeof this.json.select == "string") {
            this.pushOntologyClassIfNotExist(this.json.select);
        }
        else if (this.json.select instanceof Array) {
            this.json.select.forEach(element => {
                if (typeof element == "string") {
                    this.pushOntologyClassIfNotExist(element);
                }
                else {
                    this.pushOntologyClassIfNotExist(Object.keys(element)[0]);
                }
            });
        }
        else {
            this.pushOntologyClassIfNotExist(Object.keys(this.json.select)[0]);
        }
    }
    /**
     *
     */
    collectConstraints() {
        // We just push each of the key-value pairs in this.json["declare"]
        // into this.constraints, meaning we have a list of constraints
        if ("declare" in this.json) {
            var classes = Object.keys(this.json["declare"]);
            for (let i in classes) {
                let ontology_class = classes[i];
                const object = this.json["declare"][ontology_class][0];
                var new_constraint = {
                    class: ontology_class,
                    attribute: object.attribute,
                    operator: object.operator,
                    value: object.value,
                };
                this.constraints.push(new_constraint);
            }
        }
    }
    /**
   *
   */
    collectSelect() {
        if (typeof this.json.select == "string") {
            var object = this.json.select;
            var obj = {};
            const aggregate = this.json.aggregate;
            if (aggregate) {
                if (aggregate instanceof Array) {
                    for (let agg of aggregate) {
                        if (Object.values(agg).indexOf(object) != -1) {
                            obj[object] = null;
                            this.select.push(obj);
                        }
                    }
                }
                else if (Object.values(aggregate).indexOf(object) != -1) {
                    obj[object] = null;
                    this.select.push(obj);
                }
            }
            else {
                obj[object] = [];
                this.select.push(obj);
            }
        }
        if (this.json.select instanceof Array) {
            this.json.select.forEach(element => {
                if (typeof element == "string") {
                    if (this.json.aggregate) {
                        var found = false;
                        if (this.json.aggregate.count && this.json.aggregate.count.class == element) {
                            found = true;
                        }
                        if (this.json.aggregate.distinct && this.json.aggregate.distinct.class == element) {
                            found = true;
                        }
                        if (found) {
                            var obj = {};
                            obj[element] = null;
                            this.select.push(obj);
                        }
                        else {
                            var obj = {};
                            obj[element] = [];
                            this.select.push(obj);
                        }
                    }
                    else {
                        var obj = {};
                        obj[element] = [];
                        this.select.push(obj);
                    }
                }
                else {
                    var key = Object.keys(element)[0];
                    var value = Object.values(element);
                    var obj = {};
                    obj[key] = value;
                    this.select.push(obj);
                }
            });
        }
        else if (typeof this.json.select == "object") {
            var key = Object.keys(this.json.select)[0];
            var value = Object.values(this.json.select);
            var obj = {};
            obj[key] = value;
            this.select.push(obj);
        }
        return Promise.resolve(this.select);
    }
    /**
    *
    * @memberof Query
    */
    async findDirectRelation() {
        // const session = this.neo4j_module.v1_adapter.session
        // const driver = this.neo4j_module.v1_adapter.driver
        if (this.ontologyClasses.length == 2) {
            const class1 = this.ontologyClasses[0];
            const class2 = this.ontologyClasses[1];
            // case of direct relation ship
            const query_relation = "MATCH (" + item[class1] + ": " + class1 + ")-[r]->(" + item[class2] + ": " + class2 + ") return distinct(type(r))";
            const resultPromise = await this.session.writeTransaction(tx => tx.run(query_relation));
            // console.log(query_relation);
            return resultPromise;
        }
    }
    /**
    *
    * @memberof Query
    */
    async findShortestPath() {
        // const session = this.neo4j_module.v1_adapter.session
        // const driver = this.neo4j_module.v1_adapter.driver
        if (this.ontologyClasses.length == 2) {
            const class1 = this.ontologyClasses[0];
            const class2 = this.ontologyClasses[1];
            // case of direct relation ship
            const query_relation = "MATCH(c1: OntologyClass { name: '" + class1 + "'}), (c2: OntologyClass { name: '" + class2 + "'}), p = shortestPath((c1) - [*] -> (c2)) RETURN p";
            // Error: neo4j_module.v1Error; can't begin a txn on session with open txn
            const resultPromise = this.session.writeTransaction(tx => tx.run(query_relation));
            // console.log(query_relation);
            return resultPromise;
        }
    }
    /**
    *
    * @memberof Query
    */
    findMultipleRelation(result) {
        var result_object = result.records[0].toObject();
        var path_global = result_object.p.segments;
        for (let i = 0; i < result_object.p.length; i++) {
            this.relationship.push([
                result_object.p.segments[i].start.properties.name,
                result_object.p.segments[i].relationship.type,
                result_object.p.segments[i].end.properties.name
            ]);
        }
    }
    /**
     *
     * @memberof Query
     */
    async buildQueryMatch() {
        var query_match = "MATCH ";
        var class1 = this.relationship[0][0];
        var class2 = this.relationship[0][2];
        var rel = this.relationship[0][1];
        query_match += "(" + item[class1] + ":" + class1 + ")-[:" + rel + "]->(" + item[class2] + ":" + class2 + ")";
        for (let i = 1; i < this.relationship.length; i++) {
            var class2 = this.relationship[i][2];
            var rel = this.relationship[i][1];
            query_match += "-[:" + rel + "]->(" + item[class2] + ":" + class2 + ")";
        }
        this.query_match = query_match;
        return Promise.resolve(this.query_match);
    }
    /**
    *
    * @memberof Query
    */
    async buildQueryWhere() {
        // console.log("enter build where", this.constraints);
        const constraint = this["constraints"][0];
        if (constraint.operator == "equals") {
            constraint.operator = "=";
        }
        this.query_where = "WHERE " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'";
        for (let i = 1; i < this.constraints.length; i++) {
            const constraint = this["constraints"][i];
            if (constraint.operator == "equals") {
                constraint.operator = "=";
            }
            this.query_where += " and " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'";
        }
        this.query_where += " ";
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
        const class1 = this.ontologyClasses[0];
        const class2 = this.ontologyClasses[1];
        // var result = await this.findDirectRelation()
        var result = await this.findShortestPath();
        var tables_relationship = this.findMultipleRelation(result);
        var query_match = await this.buildQueryMatch();
        if (this.constraints.length > 0) {
            var query_where = await this.buildQueryWhere();
        }
        else {
            var query_where = "";
        }
        return Promise.resolve(query_match + query_where);
    }
    /**
     *
     *  @memberof Query
     */
    async buildReturn() {
        // console.log("enter build return", this.json.aggregate);
        const aggregate = this.json.aggregate;
        const ontology = Object.keys(this.select[0])[0];
        const value = this.select[0][ontology];
        this.query_return = "RETURN ";
        if (value == null && aggregate) {
            if (aggregate.count) {
                this.query_return += "COUNT (";
                if (aggregate.distinct) {
                    this.query_return += "DISTINCT ";
                    this.query_return += item[aggregate.distinct.class];
                    if (aggregate.distinct.attribute) {
                        this.query_return += "." + aggregate.distinct.attribute + ")";
                    }
                }
                else {
                    this.query_return += item[aggregate.count.class];
                    if (aggregate.count.attribute) {
                        this.query_return += "." + aggregate.count.attribute + ")";
                    }
                }
            }
            if (aggregate.distinct) {
                this.query_return += "DISTINCT ";
                this.query_return += item[aggregate.distinct.class];
                if (aggregate.distinct.attribute) {
                    this.query_return += "." + aggregate.distinct.attribute + ")";
                }
            }
            this.query_return += item[ontology];
            if (aggregate.distinct && aggregate.distinct.attribute) {
                this.query_return += "." + aggregate.distinct.attribute;
            }
            if (aggregate.count) {
                this.query_return += ")";
            }
        }
        else if (value.length > 0) {
            this.query_return += item[ontology] + "." + value[0];
        }
        else {
            this.query_return += item[ontology];
            if (aggregate) {
                if ("count" in aggregate) {
                    this.query_return += ", COUNT (";
                    if ("distinct" in aggregate) {
                        this.query_return += "DISTINCT ";
                    }
                    // if (attribut.included(aggregate.distinct)) {
                    // }
                    this.query_return += item[aggregate.count] + ")";
                    if ("sort" in aggregate) {
                        this.query_return += " ORDER BY count(" + item[aggregate.count] + ") " + aggregate["sort"] + " ";
                    }
                }
                else if ("distinct" in aggregate) {
                    this.query_return = "RETURN DISTINCT ";
                    this.query_return += item[ontology];
                }
                if ("limit" in aggregate) {
                    this.query_return += "LIMIT " + aggregate.limit;
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
        this.query = this.query_match + this.query_where + this.query_return;
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
        return resultPromise;
    }
    /**
    *
    * @memberof Query
    */
    async treatResult(result) {
        for (let i in result.records) {
            var result_tpm = result.records[i];
            var result_object = result_tpm.toObject();
            var keys = Object.keys(result_object);
            // console.log(keys);
            // console.log(result_object);
            for (let k in keys) {
                // var res = result_object[key]
                const ontology_classe = Object.values(item);
                const key = keys[k];
                const element = result_object[key];
                if (key.includes(".")) {
                    const element_complete = key.split(".");
                    const attribut = element_complete[1];
                    const value = element;
                    var temp = {};
                    temp[attribut] = value;
                    this.result.push(temp);
                }
                else if (ontology_classe.includes(key)) {
                    if (element.properties.score) {
                        if (element.properties.score.low != 0) {
                            element.properties.score = element.properties.score.low;
                        }
                        else {
                            element.properties.score = element.properties.score.high;
                        }
                    }
                    this.result.push(element.properties);
                }
                if (key.includes("COUNT")) {
                    if (element["low"] != 0) {
                        this.result.push({ "count": element["low"] });
                    }
                    else {
                        this.result.push({ "count": result_object[key]["high"] });
                    }
                }
            }
        }
        console.log("\n\n resultat", this.result);
        return Promise.resolve(this.result);
    }
    finishAggregation() {
        // TODO
        return undefined;
    }
    /**
     * Top-level method that executes the major logical components of a semantic
     * API query.
     *
     * In this context, we are interested in finding a subgraph within the neo4j_module.v1
     * graph database corresponding to the user's query. Therefore, 'subgraph'
     * is synonymous with 'final result'
     *
     * A query must be stored in `this.json`, but this should be taken care of
     * by the constructor.
     */
    async retrieveSubgraph() {
        // Determine the ontology classes spanning the subgraph
        var valide = await this.valideJson(this.json);
        console.log("Validate Json ", valide);
        var result = await this.findPropertyKeys();
        await this.treatPropertyKeys(result);
        // console.log(this.properties);
        var result = await this.findOntologyClasses();
        await this.treatontologyClasses(result);
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
        // await this.generateCypherQuery();
        console.log("\n\n", this.query);
        console.log("\n\n");
        console.log("constraints", this.constraints);
        console.log("ontology", this.ontologyClasses);
        console.log("select", this.select);
        // Run the query on the graph database
        // (utilizes adapter we previously specified)
        var result = await this.executeQuery();
        this.treatResult(result);
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
const q8 = new Query(examples.ex8, neo);
q8.retrieveSubgraph();
// console.log("TESTTTTTTT", q6['relationship']);
// console.log("TESTTTTTTT", q1['query_match']);
// console.log("TESTTTTTTT", q1['query_where']);
// console.log(q1['neo4j_module.v1_adapter']['session']);
module.exports = {
    NeoAdapter,
    Query
};
