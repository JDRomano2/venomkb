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
    id_pred: { type: String, required: true, unique: true },
    vkb_protein_ref: { type: String, required: true },
    pmid: { type: Number, required: true },
    toxprot_id: String,
    PID: String,
    SID: String
});

Literature = mongoose.model('Literature', LiteratureSchema);
//========================================
// ADD
//========================================

/**
 * Add a literature to the database
 * @param {Object} new_literature to be added
 */
Literature.add = new_literature => {
    console.log("enter add literature fonction");
    return new Promise((resolve, reject) => {
        Literature.create(new_literature, (err, created_literature) => {
            if (err) reject(err)
            resolve(created_literature)
        })
    })
}

module.exports = Literature;
