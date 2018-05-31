const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const GenomeSchema = new mongoose.Schema({
    venomkb_id: {type: String, index:true},
    species: String,
    lastUpdates: {type: Date, required: true},
    assembly_platform: String,
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    project_homepage: String,
    name: {type: String, required: true},
    literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
});


module.exports = mongoose.model('Genome', GenomeSchema);
