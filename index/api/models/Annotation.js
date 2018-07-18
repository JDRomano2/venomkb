const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const AnnotationSchema = new mongoose.Schema({
    term: { type: String, required: true },
    id: { type: String, required: true },
    project: String,
    evidence: String
});

Annotation = mongoose.model('Annotation', AnnotationSchema);
//========================================
// ADD
//========================================

/**
 * Add an annotation to the database
 * @param {Object} new_annotation to be added
 */
Annotation.add = new_annotation => {
    return new Promise((resolve, reject) => {
        Annotation.create(new_annotation, (err, created_annotation) => {
            if (err) reject(err)
            resolve(created_annotation)
        })
    })
}

module.exports = Annotation
