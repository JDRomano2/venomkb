const mongoose = require('mongoose');
const OutLink = require('./Outlink');

const ProteinAnnotationSchema = new mongoose.Schema({
    protein_id: String,
    eco_id: String,
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
})

const SystemicEffectSchema = new mongoose.Schema({
    venomkb_id: String,
    name: String,
    protein_annotations: [{ type: mongoose.Schema.ObjectId, ref: 'ProteinAnnotation'}],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});

module.exports = mongoose.model('SystemicEffect', SystemicEffectSchema);
