const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const ReferenceSchema = new mongoose.Schema({
    pmid: Number,
    title: { type: String, required: true },
    first_author: String,
    authors: { type: [String], default: undefined },
    journal_name: String,
    doi: { type: String, default: undefined },
    citation: String,
    date: Date
});

Reference = mongoose.model('Reference', ReferenceSchema);

//========================================
// ADD
//========================================

/**
 * Add an reference to the database
 * @param {Object} new_reference to be added
 */
Reference.add = new_reference => {
    console.log("enter add reference fonction");
    return new Promise((resolve, reject) => {
        Reference.create(new_reference, (err, created_reference) => {
            if (err) reject(err)
            resolve(created_reference)
        })
    })
}

module.exports = Reference;
