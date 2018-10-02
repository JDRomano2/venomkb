// Note: You can test this by simply running `node --harmony Query.js` from
// the command line. Webpack and babel are not needed yet!

import * as neo4j_module from "neo4j-driver"
import * as config from "./semantic.cfg.js"

import * as examples from "./examples";

let item = {
    Protein: "p",
    Species: "s",
    Pfam: "f",
    SystemicEffect: "se",
    OntologyClass: "c",
    Genome: "g",
    VenomSeqData: "v"
}

enum ontology {
    OntologyClass = "OntologyClass",
    Protein = "Protein",
    Pfam = "Pfam",
    Species = "Species",
    Genome = "Genome",
    SystemicEffect = "SystemicEffect",
    VenomSeqData =  "VenomSeqData"

}

enum properties {
    name = "name",
    venomkb_id = "venomkb_id",
    score = "score",
    UniProtKB_id = "UniProtKB_id",
    aa_sequence = "aa_sequence"
}

interface aggregate_object {
    class: ontology
    attribute?: properties
}

interface aggregate {
    count?: aggregate_object
    distinct?: aggregate_object
    limit?: number
    sort?: string
}

interface input {
    select: ontology | object | Array<object | ontology>,
    declare?: any,
    aggregate?: aggregate
    post_treatment?: object | Array<object>
}

interface constraint {
    class: ontology
    attribute: properties
    operator: string
    value: string
}

class NeoAdapter {
    user: string
    password: string
    uri: string
    driver: neo4j_module.v1.Driver
    constructor(user: string, password: string, uri: string) {
        this.user = user;
        this.password = password;
        this.uri = ""
        this.driver = neo4j_module.v1.driver(uri, neo4j_module.v1.auth.basic(this.user, this.password));
        // this.session = this.driver.session();
    }
}


class Query {
    json: input
    neo4j_adapter: NeoAdapter
    session: neo4j_module.v1.Session
    ontologyClasses: Array<ontology>
    constraints: Array<constraint>
    query_match: string
    query_where: string
    query_return: string
    query: string
    relationship: Array<Array<string>>
    select: Array<object>
    result: Array<object>
    properties: Array<string>
    ontology: Array<string>

    constructor(query_json: input, neo4j_adapter: NeoAdapter) {
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

        //for validation
        this.properties = []
        this.ontology = []

        // validate JSON (naive)
        if (!('select' in this.json)) {
            throw "Error: Semantic query must include \"select\" object.";
        }
    }
    /**
    *
    * @memberof Query
    */
    async findPropertyKeys(): Promise<neo4j_module.v1.StatementResult> {
        const query = "CALL db.propertyKeys()"
        try {
            const resultPromise = await this.session.writeTransaction(tx => tx.run(
                query));
            return resultPromise
        } catch (error) {
            console.log(error);
        }
    }

    async findOntologyClasses(): Promise<neo4j_module.v1.StatementResult> {
        const query = "CALL db.labels()"
        try {
            const resultPromise = await this.session.writeTransaction(tx => tx.run(
                query));
            return resultPromise
        } catch (error) {
            console.log(error);
        }
    }

    /**
    *
    * @memberof Query
    */
    treatPropertyKeys(result: neo4j_module.v1.StatementResult): void {
        var result_object = result.records
        for (let element of result_object) {
            var res = element.toObject()
            this.properties.push(res["propertyKey"])
        }
    }

    treatontologyClasses(result: neo4j_module.v1.StatementResult): void {
        var result_object = result.records

        for (let element of result_object) {
            var res = element.toObject()
            this.ontology.push(res["label"])
        }
    }

    /**
     *
     * @param {*} json
     */
    // static validateUserInput(json: input) {
    //     validateJsonSchema(json);
    //     validateSemantics(json);
    // }

    static validateJsonSchema(json: input) {
        // Todo
    }

    static validateSemantics(json: input) {
        // Todo
    }

    valideJson(json: input) {
        const categories = ["select", "declare", "aggregate", "post_treatment"]
        const aggregates_valid = ["count", "distinct", "sort", "limit"]
        const element = Object.keys(json)

        if (element.indexOf("select") == -1) {
            console.log("There is no select in the json");
            return false
        }

        for (let elt of element) {
            if (!categories.includes(elt)) {
                console.log("Not valid key in Json : " + elt);
                return false
            }
        }

        if (json.aggregate) {
            const keys = Object.keys(json.aggregate)
            for (let key of keys) {
                if (!aggregates_valid.includes(key)) {
                    console.log("Not valid key in Json.aggregate : " + key);
                    return false
                }
            }
        }
        return true
    }
    /**
     *
     * @param {string} newClass Name of an ontology class
     */
    pushOntologyClassIfNotExist(newClass: ontology): void {
        if (this.ontologyClasses.indexOf(newClass) === -1) {
            this.ontologyClasses.push(newClass);
        }
    }

    /**
     *
     */
    async collectOntologyClasses() {
        // All keys of this.json["declare"] should be ontology classes
        if (this.json.declare) {
            var keys: Array<ontology> = <Array<ontology>>Object.keys(this.json.declare)
            for (let key of keys) {
                this.pushOntologyClassIfNotExist(key);
            }
        }
        // this.json["aggregate"] can be an object or an array,  in count or disctinct can contain ontology class
        if (this.json.aggregate) {
            if (this.json.aggregate.count)
                this.pushOntologyClassIfNotExist(this.json.aggregate.count.class)
            if (this.json.aggregate.distinct)
                this.pushOntologyClassIfNotExist(this.json.aggregate.distinct.class)
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
                    this.pushOntologyClassIfNotExist(<ontology>Object.keys(element)[0]);
                }
            });
        }
        else {
            this.pushOntologyClassIfNotExist(<ontology>Object.keys(this.json.select)[0]);
        }
    }

    /**
     *
     */
    async collectConstraints() {
        // We just push each of the key-value pairs in this.json["declare"]
        // into this.constraints, meaning we have a list of constraints

        if ("declare" in this.json) {
            var classes: Array<ontology> = <Array<ontology>>Object.keys(this.json["declare"])

            for (let i in classes) {
                let ontology_class: ontology = classes[i]
                const object = this.json["declare"][ontology_class][0]
                console.log("classes", object);

                var new_constraint: constraint = {
                    class: ontology_class,
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
            const aggregate = this.json.aggregate
            if (aggregate) {
                if (this.json.aggregate.count && this.json.aggregate.count.class == object) {
                    obj[object] = null;
                    this.select.push(obj)
                }
                else if (this.json.aggregate.distinct && this.json.aggregate.distinct.class == object) {
                    obj[object] = null;
                    this.select.push(obj)
                }
                else {
                    obj[object] = [];
                    this.select.push(obj)
                }
            }
            else {
                obj[object] = [];
                this.select.push(obj)
            }
        }
        if (this.json.select instanceof Array) {
            this.json.select.forEach(element => {
                if (typeof element == "string") {
                    if (this.json.aggregate) {
                        var found = false
                        if (this.json.aggregate.count && this.json.aggregate.count.class == element) {
                            found = true
                        }
                        if (this.json.aggregate.distinct && this.json.aggregate.distinct.class == element) {
                            found = true
                        }

                        if (found) {

                            var obj = {};
                            obj[element] = null;
                            this.select.push(obj)
                        }
                        else {
                            var obj = {};
                            obj[element] = [];
                            this.select.push(obj)
                        }

                    }
                    else {
                        var obj = {};
                        obj[element] = [];
                        this.select.push(obj)
                    }

                }
                else {

                    var key = Object.keys(element)[0]
                    var value = Object.values(element)
                    var obj = {};
                    obj[key] = value
                    // console.log("AAAAAAAAAAAAAA", obj);
                    this.select.push(obj)

                }
            });

        }
        else if (typeof this.json.select == "object") {
            var key = Object.keys(this.json.select)[0]
            var value = Object.values(this.json.select)
            var obj = {};
            obj[key] = value
            this.select.push(obj)
        }
    }



    /**
    *
    * @memberof Query
    */
    async findDirectRelation() {
        // const session = this.neo4j_module.v1_adapter.session
        // const driver = this.neo4j_module.v1_adapter.driver

        if (this.ontologyClasses.length == 2) {

            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]
            // case of direct relation ship
            const query_relation = "MATCH (" + item[class1] + ": " + class1 + ")-[r]->(" + item[class2] + ": " + class2 + ") return distinct(type(r))"
            // console.log("Query relation", query_relation);

            const resultPromise = await this.session.writeTransaction(tx => tx.run(
                query_relation));

            // console.log(query_relation);

            return resultPromise
        }
    }

    /**
    *
    * @memberof Query
    */
    async findShortestPathBetween2(class1: ontology, class2: ontology): Promise<neo4j_module.v1.StatementResult> {
        // const session = this.neo4j_module.v1_adapter.session
        // const driver = this.neo4j_module.v1_adapter.driver

        // case of direct relation ship
        const query_relation = "MATCH(c1: OntologyClass { name: '" + class1 + "'}), (c2: OntologyClass { name: '" + class2 + "'}), p = shortestPath((c1) - [*] -> (c2)) RETURN p"

        // Error: neo4j_module.v1Error; can't begin a txn on session with open txn
        const resultPromise = await this.session.writeTransaction(tx => tx.run(
            query_relation));

        // console.log(query_relation);

        return resultPromise
    }

    /**
    *
    * @memberof Query
    */
    findMultipleRelation(result: neo4j_module.v1.StatementResult): void {
        var result_object = <any>result.records[0].toObject()
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
    buildQueryMatch(): void {
        var query_match = "MATCH "
        if (this.ontologyClasses.length == 1) {
            query_match += "(" + item[this.ontologyClasses[0]] + ":" + this.ontologyClasses[0] + ")"
        }
        else {
            var class1 = <ontology>this.relationship[0][0]
            var class2 = <ontology>this.relationship[0][2]
            var rel = this.relationship[0][1]
            query_match += "(" + item[class1] + ":" + class1 + ")-[:" + rel + "]->(" + item[class2] + ":" + class2 + ")"

            for (let i = 1; i < this.relationship.length; i++) {
                class2 = <ontology>this.relationship[i][2]
                var rel = this.relationship[i][1]
                query_match += "-[:" + rel + "]->(" + item[class2] + ":" + class2 + ")"

            }
        }
        this.query_match = query_match
    }

    /**
    *
    * @memberof Query
    */
    buildQueryWhere(): void {
        // console.log("enter build where", this.constraints);

        const constraint = this["constraints"][0]
        if (constraint.operator == "equals") {
            constraint.operator = "="
        }
        this.query_where = " WHERE " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'"

        for (let i = 1; i < this.constraints.length; i++) {
            const constraint = this["constraints"][i]
            if (constraint.operator == "equals") {
                constraint.operator = "="
            }
            this.query_where += " and " + item[constraint.class] + "." + constraint["attribute"] + " " + constraint["operator"] + " '" + constraint["value"] + "'"


        }
        this.query_where += " "
    }

    /**
     *
     * @memberof Query
     */
    async buildMatch(): Promise<string> {
        // This method looks at this.ontologyClasses and writes
        // a MATCH clause that contains a subgraph with each of these classes
        // included.
        if (this.ontologyClasses.length > 1) {

            const class1 = this.ontologyClasses[0]
            const class2 = this.ontologyClasses[1]


            if (this.ontologyClasses.length > 1) {
                var result = await this.findShortestPathBetween2(this.ontologyClasses[0], this.ontologyClasses[1])
                var tables_relationship = this.findMultipleRelation(result)
            }

            if (this.ontologyClasses.length > 2) {
                const ontology: ontology = this.ontologyClasses[2]
                var ontology_linked = []
                for (let relation of this.relationship) {
                    ontology_linked.push(relation[0])
                    ontology_linked.push(relation[2])
                }
                if (!ontology_linked.includes(ontology)) {
                    var result = await this.findShortestPathBetween2(this.ontologyClasses[1], this.ontologyClasses[2])
                    var tables_relationship = this.findMultipleRelation(result)
                }
            }
        }

        // console.log("relationship", tables_relationship);

        this.buildQueryMatch()

        if (this.constraints.length > 0 ) {
            this.buildQueryWhere()
        }

        return Promise.resolve(this.query_match + this.query_where);
    }

    /**
     *
     *  @memberof Query
     */
    buildReturn(): void {
        const aggregate = this.json.aggregate
        this.query_return = "RETURN "
        for (let i in this.select) {
            var select = this.select[i]
            if (Number(i) > 0) {
                this.query_return += ", "
            }

            const ontology = <ontology>Object.keys(select)[0]
            const value = select[ontology]



            if (value == null && aggregate) {

                if (aggregate.count) {
                    this.query_return += "COUNT ("
                    if (aggregate.distinct && aggregate.count.class == aggregate.distinct.class) {
                        this.query_return += "DISTINCT "
                        this.query_return += item[aggregate.distinct.class]
                        if (aggregate.distinct.attribute) {
                            this.query_return += "." + aggregate.distinct.attribute + ")"
                        }
                        else {
                            this.query_return += ")"
                        }
                    }

                    else {

                        this.query_return += item[aggregate.count.class]
                        if (aggregate.count.attribute) {
                            this.query_return += "." + aggregate.count.attribute + ")"
                        }
                        else {
                            this.query_return += ")"
                        }
                    }
                }

                else if (aggregate.distinct) {
                    this.query_return += "DISTINCT "
                    this.query_return += item[aggregate.distinct.class]
                    if (aggregate.distinct.attribute) {
                        this.query_return += "." + aggregate.distinct.attribute
                    }
                }
            }

            else if (value.length > 0) {

                if (aggregate && aggregate.distinct) {

                    this.query_return += "DISTINCT "
                    this.query_return += item[aggregate.distinct.class]
                    if (aggregate.distinct.attribute) {
                        this.query_return += "." + aggregate.distinct.attribute
                    }
                }
                else {

                    this.query_return += item[ontology] + "." + value[0]
                    for (let i = 1; i < select[ontology]; i++) {
                        this.query_return += ", " + item[ontology] + "." + value[i]
                    }
                }
            }

            else {
                this.query_return += item[ontology]
                if (aggregate) {
                    if (aggregate.count) {
                        this.query_return += ", COUNT ("
                        if (aggregate.distinct && aggregate.count.class == aggregate.distinct.class) {
                            this.query_return += "DISTINCT "
                            this.query_return += item[aggregate.distinct.class] + ")"
                        }
                        else {
                            this.query_return += item[aggregate.count.class] + ")"

                        }
                        if (aggregate.sort) {
                            this.query_return += " ORDER BY count(" + item[aggregate.count.class] + ") " + aggregate["sort"] + " "
                        }
                    }

                    else if ("distinct" in aggregate) {
                        this.query_return = "RETURN DISTINCT "
                        this.query_return += item[ontology]
                    }

                    if ("limit" in aggregate) {
                        this.query_return += "LIMIT " + aggregate.limit
                    }
                }
            }
        }
    }



    /**
     *
     *
     * @memberof Query
     */
    joinClauses(): void {
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
     * Writes the current query to stdout (server-side)
     */
    logQuery() {
        console.log(JSON.stringify(this.json, null, 2));
    }

    async executeQuery(): Promise<neo4j_module.v1.StatementResult> {
        const resultPromise = await this.session.writeTransaction(tx => tx.run(this.query));
        this.session.close();
        return resultPromise
    }




    /**
    *
    * @memberof Query
    */
    treatResult(result: neo4j_module.v1.StatementResult): void {
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

                        if (element.properties.score.low != 0) {
                            element.properties.score = element.properties.score.low
                        }
                        else {
                            element.properties.score = element.properties.score.high
                        }
                    }
                    this.result.push(element.properties)
                }

                if (key.includes("COUNT")) {
                    if (element["low"] != 0) {
                        this.result.push({ "count": element["low"] })
                    }
                    else {
                        this.result.push({ "count": result_object[key]["high"] })
                    }

                }
            }

        }
        // console.log("\n\n resultat", this.result);
    }

    finishAggregation() {
        // TODO
        return undefined;
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
        var valide = this.valideJson(this.json)
        if (valide) {
            var result = await this.findPropertyKeys()
            this.treatPropertyKeys(result)
            var result = await this.findOntologyClasses()
            this.treatontologyClasses(result)

            const promises =[]
            promises.push(this.collectOntologyClasses())
            promises.push(this.collectConstraints())
            promises.push(this.collectSelect())

            // Apply constraints to ontology classes when provided, such as
            // filtering by name
            // -> set constraints to [{"Protein": {"name": {"contains": "Phospholipase"} } }]

            // Determine what should be return
            // -> set select to [[Species, complete], [Protein, name]]

            // Build a string corresponding to the cypher query
            // (Probably the most complicated method in this class)
            await this.generateCypherQuery();
            console.log("\n\n", this.query);

            console.log("\n\n");
            console.log("constraints", this.constraints);
            console.log("ontology", this.ontologyClasses);
            console.log("select", this.select);

            // Run the query on the graph database
            // (utilizes adapter we previously specified)
            var result = await this.executeQuery();
            this.treatResult(result)
            console.log("relationship", this.relationship);

            // console.log("\n\n");
            console.log("\n\nresultat", this.result);
            // Apply any final filtering steps or transformations that aren't yet
            // taken care of. We can build features into this as we encounter
            // scenarios that can't be handled by the cypher query alone.
            this.finishAggregation();

        }
        this.neo4j_adapter.driver.close();
    }
}


// Test the class out
const neo = new NeoAdapter(config.USER, config.PASSWORD, config.URI);

const q10 = new Query(examples.ex10, neo);

q10.retrieveSubgraph().then(() => {
    console.log("finished!");
}).catch(err => {
    console.log(err);
})
// console.log("TESTTTTTTT", q6['relationship']);
// console.log("TESTTTTTTT", q1['query_match']);
// console.log("TESTTTTTTT", q1['query_where']);
// console.log(q1['neo4j_module.v1_adapter']['session']);

export {
    NeoAdapter,
    Query
}