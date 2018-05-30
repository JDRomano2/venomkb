const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const LiteratureSchema = new mongoose.Schema({
    o_name: String,
    o_type: String,
    o_cui: String,
    s_name: String,
    s_type: String,
    s_cui: String,
    predicate: String,
    id_pred: String,
    pid: Number,
    sid: Number,
    vkb_protein_ref: String,
    pmid: Number,
    toxprot_id: String
});


module.exports = mongoose.model('Literature', LiteratureSchema);
