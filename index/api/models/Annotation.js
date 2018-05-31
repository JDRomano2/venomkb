const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const AnnotationSchema = new mongoose.Schema({
    term: { type: String, required: true },
    id: { type: String, required: true },
    project: String,
    evidence: String
});


module.exports = mongoose.model('Annotation', AnnotationSchema);
