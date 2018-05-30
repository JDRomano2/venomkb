const mongoose = require('mongoose');

const OutLinkSchema = new mongoose.Schema({
    ressource: String,
    primary_id: String,
    attribute: String,
});


// Schema to enforce consistent structure.
const ProteinSchema = new mongoose.Schema({
    venomkb_id: {type: String, unique: true},
    species: String,
    name: String,
    lastUpdated: Number,
    description: String,
    aa_sequence: String,
    venom_ref: String,
    pdb_image_url: String,
    pdb_structure_known: Boolean,
    annotation_score: Number,
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
    go_annotations: [{ type: mongoose.Schema.ObjectId, ref: 'Annotation' }],
    out_links: [OutLinkSchema]

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


