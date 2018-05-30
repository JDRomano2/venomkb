const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const AnnotationSchema = new mongoose.Schema({
    project: String,
    term: String,
    id: String,
    evidence: String
});


module.exports = mongoose.model('Annotation', AnnotationSchema);
