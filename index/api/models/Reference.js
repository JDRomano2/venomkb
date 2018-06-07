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
    date: Date
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
// ADD
//========================================

/**
 * Add an reference to the database
 * @param {Object} new_reference to be added
 */
Reference.add = new_reference => {
    console.log("enter add reference fonction");
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
Reference.update = (venomkb_id, updated_reference) => {
    return new Promise((resolve, reject) => {
        Reference.findOneAndUpdate({ venomkb_id: venomkb_id }, updated_reference, err => {
            if (err) return reject(err)
            resolve()
        })
    })
}

module.exports = Reference;
