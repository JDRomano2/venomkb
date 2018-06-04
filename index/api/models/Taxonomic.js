const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const TaxonomicSchema = new mongoose.Schema({
    taxonName: {type: String, required: true},
    itis_tsn: String,
    rankName: String
});

const Taxonomic = mongoose.model('Taxonomic', TaxonomicSchema);

//========================================
// ADD
//========================================

/**
 * Add a taxonomic to the database
 * @param {Object} new_taxonomic to be added
 */
Taxonomic.add = new_taxonomic => {
    return new Promise((resolve, reject) => {

        Taxonomic.create(new_taxonomic, (err, created_taxonomic) => {
            if (err) reject(err)

            resolve(created_taxonomic)
        })
    })
}

module.exports = mongoose.model('Taxonomic', TaxonomicSchema);
