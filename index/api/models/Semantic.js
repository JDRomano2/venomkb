const mongoose = require('mongoose');

const { NeoAdapter, Query } = require('../semantic/Query');
const {
    USER,
    PASSWORD,
    URI
} = require('../semantic/semantic.cfg');

const neo = new NeoAdapter(USER, PASSWORD, URI);


const SemanticSchema = new mongoose.Schema({
    semanticResponse: { type: Object, required: true }
});



const Semantic = mongoose.model('Semantic', SemanticSchema);

Semantic.runQuery = async (query) => {
    const q = new Query(query, neo);

    await q.retrieveSubgraph();

    const result = q['result'];

    return {result};
}

Semantic.fetchFromQuery = (query_json) => {
    return new Promise((resolve, reject) => {
        Semantic.runQuery({query: query_json})
    })
}


module.exports = Semantic;
