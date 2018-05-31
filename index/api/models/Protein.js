const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const ProteinSchema = new mongoose.Schema({
    venomkb_id: { type: String, index:true },
    lastUpdated: {type: Date, required:true},
    species: {type: String, required: true},
    name: {type: String, required: true},
    description: String,
    aa_sequence: String,
    venom_ref: {type: String, required: true},
    pdb_image_url: String,
    pdb_structure_known: {type:Boolean, required: true},
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
    go_annotations: [{ type: mongoose.Schema.ObjectId, ref: 'Annotation' }],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
});

const Protein = mongoose.model('Protein', ProteinSchema);

/**
 * Get an protein given its id
 * @param {ObjectId} id  id of the protein to get
 * @param {String} path path to populate (leave blank if none)
 */
Protein.getByVenomKBId = (id, path) => {
  return new Promise((resolve, reject) => {
    Protein.findOne({ venomkb_id: id })
      .populate(path || '')
      .exec((err, protein) => {
        if (err) {
          reject(err);
        }
        resolve(protein);
      });
  });
};

module.exports = Protein;


