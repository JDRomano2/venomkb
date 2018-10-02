const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const TaxonomicSchema = new mongoose.Schema({
    taxonName: {type: String, required: true},
    itis_tsn: String,
    rankName: String
});

TaxonomicSchema.virtual('species', {
    ref: 'Species', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'taxonomic_lineage', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
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
// UPDATE
//========================================
/**
 * Update a taxonomic to the database
 * @param {Object} updated_taxonomic
 */
Taxonomic.update = (_id, updated_taxonomic) => {
    return Taxonomic.findOneAndUpdate({ _id: _id }, updated_taxonomic).exec()
}

//========================================
// DELETE
//========================================

/**
 * Delete a taxonomic
 * @param {ObjectId} id taxonomic id who needs to be removed from the database
 */
Taxonomic.delete = id => {
    return new Promise((resolve, reject) => {
        Taxonomic.findById(id).populate("species").then(taxonomic => {
            if (taxonomic.species.length < 2) {
                taxonomic.remove(err => {
                    if (err) {
                        reject(err)
                    }
                    resolve()
                })
            }
            else {
                resolve()
            }
        })
    })
}

module.exports = mongoose.model('Taxonomic', TaxonomicSchema);
