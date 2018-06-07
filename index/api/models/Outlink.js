const mongoose = require('mongoose');

const OutLinkSchema = new mongoose.Schema({
    resource: {type: String, required: true},
    primary_id: {type: String, required: true},
    shared: {type: Boolean, required: true},
    attribute: String,

});

OutLinkSchema.virtual('proteins', {
    ref: 'Protein', // The model to use
    localField: '_id', // Find people where `localField`
    foreignField: 'out_links', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

const OutLink = mongoose.model('OutLink', OutLinkSchema);

//========================================
// GET
//========================================

/**
 * Get a outlink given its id
 * @param {ObjectId} id  id of the outlink to get
 */
OutLink.getById = (id) => {
    return new Promise((resolve, reject) => {
        OutLink.findOne({ _id: id })
            .exec((err, out_link) => {
                if (err) {
                    reject(err);
                }
                resolve(out_link);
            });
    });
};

/**
 * returns all the Outlink
 */
OutLink.getAll = () => {
    return new Promise((resolve, reject) => {
        OutLink.find({})
            .exec((err, out_links) => {
                if (err) reject(err)
                resolve(out_links)
            })
    })
}


//========================================
// ADD
//========================================

/**
 * Add a out_link to the database
 * @param {Object} new_out_link to be added
 */
OutLink.add = new_out_link => {
    console.log("enter add out link fonction");
    if (!new_out_link.resource)
        return Promise.reject({ message: "Out links sent requires a resource field" })

    if (!new_out_link.primary_id)
        return Promise.reject({ message: "Out links sent requires a primary_id" })

    return new Promise((resolve, reject) => {
        OutLink.create(new_out_link, (err, created_out_link) => {
            if (err) reject(err)
            resolve(created_out_link)
        })
    })
}

//========================================
// UPDATE
//========================================
/**
 * Update a Outlink to the database
 * @param {Object} updated_out_link
 */
OutLink.update = (id, updated_out_link) => {
    return OutLink.findOneAndUpdate({ _id: id }, updated_out_link).exec()

}

//========================================
// DELETE
//========================================

/**
 * Delete an out_link
 * @param {ObjectId} id out_link id who needs to be removed from the database
 */
OutLink.delete = id => {
    return new Promise((resolve, reject) => {
        OutLink.getById(id).then(out_link => {
            if (!species) {
                reject({ status: "Empty" })
            }
            out_link.remove(err => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    })
}
module.exports = OutLink
