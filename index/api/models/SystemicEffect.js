const mongoose = require('mongoose');
const OutLink = require('./Outlink');
const Protein = require('./Protein')

const ProteinAnnotationSchema = new mongoose.Schema({
    protein_id: {type: mongoose.Schema.ObjectId, ref: 'Protein'},
    eco_id: String,
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
})

const SystemicEffectSchema = new mongoose.Schema({
    venomkb_id: {type: String, required: true, unique:true},
    name: {type: String, required: true},
    lastUpdated: {type: Date, default: Date.now},
    protein_annotations: [ProteinAnnotationSchema],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});

/**
 * Add protein annotation
 * @param {Array} protein_annotations an array of protein annotation objects
 */
SystemicEffectSchema.methods.addProteinAnnotation = function (protein_annotations) {
    if (!(protein_annotations.constructor === Array)) {
        return Promise.reject({ message: "protein annotations not a list" })
    }

    const systemicEffect = this;

    if (typeof protein_annotations[0] == "object") {
        promises = []
        protein_annotations.forEach(element => {
            promises.push(new Promise ((resolve, reject)=>{

                return Protein.getByVenomKBId(element.protein)
                .then((protein)=> {
                    if (protein) {
                        element.protein = protein._id
                        systemicEffect.protein_annotations.push(element)
                        resolve(element)
                    }
                    else {
                        return Promise.reject({message: "Protein "+ element.protein +" not found"})
                    }
                }).catch(reject)
            }))
        })
        return Promise.all(promises).then(() => {
            return systemicEffect.save()
        });
    } else {
        return Promise.reject({ message: "Protein annotations list must contain object" })
    }
}

/**
 * Add outlinks to a systemic effect
 * @param {Array} out_links an array of out_links objects
 */
SystemicEffectSchema.methods.addOutLinks = function (out_links) {
    if (!(out_links.constructor === Array)) {
        return Promise.reject({ message: "Literatures not a list" })
    }

    const systemicEffect = this;
    if (typeof out_links[0] == "object") {
        const promises = [];
        out_links.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                if (element.shared) {
                    return OutLink.findOne(element).exec().then((el) => {
                        if (el) {
                            return Promise.resolve(el)
                        }
                        return OutLink.add(element)
                    }).then((out_link) => {
                        systemicEffect.out_links.push(out_link._id);
                        resolve();
                    }).catch(reject)
                }
                if (!element.primary_id)
                return reject({ message: "NOT SHARED " + element.primary_id })
                return OutLink.add(element)

                .then((out_link) => {
                    systemicEffect.out_links.push(out_link._id);
                    resolve();
                }).catch(reject)

            }))
        })
        return Promise.all(promises).then(() => {
            return protein.save()
        });
    } else {
        return Promise.reject({ message: "Out Link list must contain object" })
    }
}

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
 * Get a systemic_effect given its venomkb_id
 * @param {String} venomkb_id  venomkb_id of the systemic_effect to get
 */
SystemicEffect.getByVenomKBId = (venomkb_id) =>{
    return new Promise((resolve, reject) => {
        SystemicEffect.findOne({venomkb_id : venomkb_id})
        .exec((err, systemic_effect) => {
            if (err) {
                reject (err)
            }
            resolve(systemic_effect)
        })
    })
}
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

/**
 * Get a systemic effect given its name
 * @param {String} name  name of the Species to get
 * @param {String} path path to populate (leave blank if none)
 */
SystemicEffect.getByName = (name, path) => {
    return new Promise((resolve, reject) => {
        SystemicEffect.findOne({$text: {$search: name}})
            .populate(path || '')
            .exec((err, systemic_effect) => {
                if (err) {
                    reject(err);
                }
                resolve(systemic_effect);
            });
    });
};


//========================================
// ADD
//========================================

/**
 * Add a systemic_effect to the database
 * @param {Object} new_systemic_effect to be added
 */
SystemicEffect.add = new_systemic_effect => {
    return new Promise((resolve, reject) => {
        SystemicEffect.create(new_systemic_effect, (err, created_systemic_effect) => {
            if (err) reject(err)
            resolve(created_systemic_effect)
        })
    })
}


module.exports = SystemicEffect

