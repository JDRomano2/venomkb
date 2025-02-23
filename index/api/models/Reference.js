const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const ReferenceSchema = new mongoose.Schema({
    pmid: Number,
    title: { type: String, required: true },
    first_author: String,
    authors: { type: [String], default: undefined },
    journal_name: String,
    doi: { type: String, default: undefined },
    citation: String,
    date: String
});

ReferenceSchema.virtual('proteins', {
    ref: 'Protein', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'literature_references', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

Reference = mongoose.model('Reference', ReferenceSchema);

//========================================
// GET
//========================================
/**
 * Update a Reference to the database
 * @param {Object} updated_reference
 */
Reference.getByPmid = (pmid) => {
    return Reference.findOne({ pmid: pmid }).exec()
}


//========================================
// ADD
//========================================

/**
 * Add an reference to the database
 * @param {Object} new_reference to be added
 */
Reference.add = new_reference => {
    return new Promise((resolve, reject) => {
        Reference.create(new_reference, (err, created_reference) => {
            if (err) reject(err)
            resolve(created_reference)
        })
    })
}

//========================================
// UPDATE
//========================================
/**
 * Update a Reference to the database
 * @param {Object} updated_reference
 */
Reference.update = (id, updated_reference) => {
    return Reference.findOneAndUpdate({ _id: id }, updated_reference).exec()
}


//========================================
// DELETE
//========================================

/**
 * Delete a reference
 * @param {ObjectId} id reference id who needs to be removed from the database
 */
Reference.delete = id => {
    return new Promise((resolve, reject) => {
        Reference.findById(id).populate("proteins").then(reference => {
            if (reference.proteins.length < 2) {
                reference.remove(err => {
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
module.exports = Reference;
