const mongoose = require('mongoose');
const OutLink = require('./Outlink');

const ProteinAnnotationSchema = new mongoose.Schema({
    protein_id: String,
    eco_id: String,
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
})

const SystemicEffectSchema = new mongoose.Schema({
    venomkb_id: {type: String, required: true, unique:true},
    name: {type: String, required: true},
    protein_annotations: [{ type: mongoose.Schema.ObjectId, ref: 'ProteinAnnotation'}],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});
const SystemicEffect = mongoose.model('SystemicEffect', SystemicEffectSchema);

//========================================
// GET
//========================================

/**
 * Get a systemic_effect given its id
 * @param {ObjectId} id  id of the systemic_effect to get
 */
SystemicEffect.getById = (id) => {
    return new Promise((resolve, reject) => {
        SystemicEffect.findOne({ _id: id })
            .exec((err, systemic_effect) => {
                if (err) {
                    reject(err);
                }
                resolve(systemic_effect);
            });
    });
};

/**
 * returns all the Outlink
 */
SystemicEffect.getAll = () => {
    return new Promise((resolve, reject) => {
        SystemicEffect.find({})
            .exec((err, systemic_effects) => {
                if (err) reject(err)
                resolve(systemic_effects)
            })
    })
}


//========================================
// ADD
//========================================

/**
 * Add a systemic_effect to the database
 * @param {Object} new_systemic_effect to be added
 */
SystemicEffect.add = new_systemic_effect => {
    console.log("enter add out link fonction");
    if (!new_systemic_effect.resource)
        return Promise.reject({ message: "Out links sent requires a resource field" })

    if (!new_systemic_effect.primary_id)
        return Promise.reject({ message: "Out links sent requires a primary_id" })

    return new Promise((resolve, reject) => {
        SystemicEffect.create(new_systemic_effect, (err, created_systemic_effect) => {
            if (err) reject(err)
            resolve(created_systemic_effect)
        })
    })
}

//========================================
// DELETE
//========================================

/**
 * Delete an systemic_effect
 * @param {ObjectId} id systemic_effect id who needs to be removed from the database
 */
SystemicEffect.delete = id => {
    return new Promise((resolve, reject) => {
        SystemicEffect.getById(id).then(systemic_effect => {
            if (!species) {
                reject({ status: "Empty" })
            }
            systemic_effect.remove(err => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    })
}
module.exports = SystemicEffect

