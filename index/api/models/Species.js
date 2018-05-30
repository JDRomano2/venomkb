const mongoose = require('mongoose');

const SpeciesSchema = new mongoose.Schema({
    venomkb_id: { type: String, unique: true },
    species: String,
    lastUpdated: Number,
    name: String,
    commom_name: String,
    venom_ref: String,
    annotation_score: Number,
    species_image_url: String,
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    taxonomic_lineage: [{ type: mongoose.Schema.ObjectId, ref: 'Taxonomic' }],
    venom: [{ type: mongoose.Schema.ObjectId, ref: 'Venom'}]
});

module.exports = mongoose.model('Species', SpeciesSchema);
