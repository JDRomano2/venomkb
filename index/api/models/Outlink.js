const mongoose = require('mongoose');

const OutLinkSchema = new mongoose.Schema({
    ressource: {type: String, required: true},
    primary_id: {type: String, required: true},
    attribute: String,
});

const OutLink = mongoose.model('OutLink', OutLinkSchema);
//========================================
// ADD
//========================================

/**
 * Add a out_link to the database
 * @param {Object} new_out_link to be added
 */
OutLink.add = new_out_link => {
    console.log("enter add fonction");
    if (!new_out_link.ressource)
        return Promise.reject({ message: "Out links sent requires a ressource field" })

    if (!new_out_link.primary_id)
        return Promise.reject({ message: "Out links sent requires a primary_id" })

    return new Promise((resolve, reject) => {
        OutLink.create(new_out_link, (err, created_out_link) => {
            if (err) reject(err)
            console.log("created out_link", created_out_link);
            resolve(created_out_link)
        })
    })
}
module.exports = OutLink
