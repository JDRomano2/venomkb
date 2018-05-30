const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const ReferenceSchema = new mongoose.Schema({
    doi: String,
    title: String,
    first_author: String,
    journal_name: String,
    date: String,
    pmid: String
});


module.exports = mongoose.model('Reference', ReferenceSchema);
