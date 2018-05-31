const mongoose = require('mongoose');


const VenomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proteins: [{ type: mongoose.Schema.ObjectId, ref: 'Protein', required: true }],
});


const SpeciesSchema = new mongoose.Schema({
    venomkb_id: { type: String, index:true },
    lastUpdated: {type: Date, required: true},
    name: {type: String, required: true, unique:true},
    commom_name: String,
    venom_ref: {type: String, required: true},
    annotation_score: {type:Number, min:1, max:5, required:true},
    species_image_url: String,
    venom: VenomSchema,
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    taxonomic_lineage: [{ type: mongoose.Schema.ObjectId, ref: 'Taxonomic' }],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
});

module.exports = mongoose.model('Species', SpeciesSchema);
