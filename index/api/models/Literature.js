const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const LiteratureSchema = new mongoose.Schema({
    s_name: { type: String, required: true },
    s_cui: { type: String, required: true },
    s_type: { type: String, required: true },
    predicate: { type: String, required: true },
    o_name: { type: String, required: true },
    o_cui: { type: String, required: true },
    o_type: { type: String, required: true },
    id_pred: { type: String, required: true },
    vkb_protein_ref: { type: String, required: true },
    pmid: { type: Number, required: true },
    toxprot_id: String,
    PID: String,
    SID: String
});


module.exports = mongoose.model('Literature', LiteratureSchema);
