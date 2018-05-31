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


module.exports = mongoose.model('Reference', ReferenceSchema);
