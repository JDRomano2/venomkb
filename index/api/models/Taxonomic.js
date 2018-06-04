const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const TaxonomicSchema = new mongoose.Schema({
    taxonName: {type: String, required: true},
    itis_tsn: String,
    rankName: String
});

const Taxonomic = mongoose.model('Taxonomic', TaxonomicSchema);


//========================================
// GET
//========================================

/**
 * Get a taxonomic given its id
 * @param {ObjectId} id  id of the taxonomic to get
 */
Taxonomic.getById = (id) => {
    return new Promise((resolve, reject) => {
        Taxonomic.findOne({ _id: id })
            .exec((err, taxonomic) => {
                if (err) {
                    reject(err);
                }
                resolve(taxonomic);
            });
    });
};


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


//========================================
// DELETE
//========================================

/**
 * Delete a taxonomic
 * @param {ObjectId} id taxonomic id who needs to be removed from the
 */
Taxonomic.delete = id => {
    return new Promise((resolve, reject) => {
        Taxonomic.getById(id).then(taxonomic => {
            if (!taxonomic) {
                reject({ status: "Empty" })
            }
            taxonomic.remove(err => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    })
}


module.exports = mongoose.model('Taxonomic', TaxonomicSchema);
