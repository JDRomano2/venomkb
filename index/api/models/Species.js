const mongoose = require('mongoose');
const Taxonomic = require('./Taxonomic');
const Protein = require('./Protein');


const OutLinkSchema = new mongoose.Schema({
    resource: { type: String, required: true },
    primary_id: { type: String, required: true },
    attribute: String,
});

const SpeciesSchema = new mongoose.Schema({
    venomkb_id: { type: String, index: true },
    lastUpdated: { type: Date, default: Date.now},
    venom_ref: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    common_name: String,
    species_image_url: String,
    venom: {
        name: { type: String, required: true },
        //proteins: [{ type: mongoose.Schema.ObjectId, ref: 'Protein' }],
        proteins: [{ type: String, required: true }]

    },
    //taxonomic_lineage: [{ type: mongoose.Schema.ObjectId, ref: 'Taxonomic' }],
    taxonomic_lineage: [],
    //out_links: [OutLinkSchema],
    out_links: {},
    literature_references: []
});

/**
 * Add taxonomic_lineage to a species
 * @param {Array} taxonomic an array of taxonomic object
 */
SpeciesSchema.methods.addTaxonomic = function (taxonomic) {
    // Test wether taxonomic is a list of object ids or objects
    if (!(taxonomic.constructor === Array)) {
        return Promise.reject({ message: "Taxonomic not a list" })
    }

    const species = this;

    if (typeof taxonomic[0] == "object") {
        const promises = [];
        taxonomic.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                return Taxonomic.findOne(element).then((el) => {
                    if (el) {
                        return Promise.resolve(el);
                    } else {
                        return Taxonomic.add(element);
                    }
                }).then((taxonomic_element) => {
                    species.taxonomic_lineage.push(taxonomic_element._id);
                    resolve();
                }).catch(reject)
            })
            )
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        taxonomic.forEach(element => {
            species.taxonomic_lineage.push(element);
            return species.save();
        })
    }
}

/**
 * Update taxonomic_lineage to a species
 * @param {Array} taxonomic_lineage an array of taxonomic objects
 */

SpeciesSchema.methods.updateTaxonomic = function (taxonomic_lineage) {
    if (!(taxonomic_lineage.constructor === Array)) {
        return Promise.reject({ message: "Taxonomic not a list" })
    }
    const species = this;
    if (taxonomic_lineage.length === 0 || typeof taxonomic_lineage[0] == "object") {
        const promises = [];
        taxonomic_lineage.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                return Taxonomic.findOne(element).exec().then(found => {
                    if (found) {
                        if (species.taxonomic_lineage.indexOf(found._id) == -1) {
                            species.taxonomic_lineage.push(found._id);
                            resolve()
                        }
                    }
                    else {
                        return Taxonomic.add(element).then((taxonomic) => {
                            species.taxonomic_lineage.push(taxonomic._id);
                            resolve();
                        }).catch(reject)
                    }
                })
            }))
        })
        species.taxonomic_lineage.forEach(element_id => {
            promises.push(new Promise((resolve, reject) => {
                return Taxonomic.findOne(element_id).populate('species').exec().then((taxonomic) => {
                    let index = taxonomic_lineage.findIndex((element) => {
                        return element.taxonName == taxonomic.taxonName &&
                            element.itis_tsn == taxonomic.itis_tsn &&
                            element.rankName == taxonomic.rankName
                    })
                    if (index == -1) {
                        if (taxonomic.species.length == 1) {
                            return taxonomic.remove().then(() => {
                                species.taxonomic_lineage.splice(index, 1)
                                resolve()
                            }).catch(reject)
                        }
                        species.taxonomic_lineage.splice(index, 1)
                    }
                    resolve()
                })
            }))
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        return Promise.reject({ message: "Taxonomicfupdate list must contain object" })
    }

}
/**
 * Add venom to a species
 * @param {Object} venom a venom object, containing a name and a list of protein's venomkb_id
 */
SpeciesSchema.methods.addVenom = function (venom) {
    // Test wether venom is a object

    if (!typeof (venom) == "object")
        return Promise.reject({ message: "Venom sent not an object" })

    if (!venom.name)
        return Promise.reject({ message: "Venom sent requires a name field" })

    if (!venom.proteins)
        return Promise.reject({ message: "Venom sent requires a proteins list" })

    const species = this;

    // Add proteins
    if ((venom.proteins.constructor === Array)) {
        const promises = [];
        venom.proteins.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                Protein.getByVenomKBId(element).then((protein) => {
                    if (!protein) {
                        reject({ message: "The protein venomkbId: " + element + " was not found in the database ... Please add it before" })
                    }
                    species.venom.proteins.push(protein._id)
                    resolve();
                }).catch(reject)
            }))
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        return Promise.reject({ message: "Proteins field should be an array" })
    }
}

SpeciesSchema.methods.updateVenom = function (venom) {
    if (!typeof (venom) == "object")
        return Promise.reject({ message: "Venom sent not an object" })

    if (!venom.name)
        return Promise.reject({ message: "Venom sent requires a name field" })

    if (!venom.proteins)
        return Promise.reject({ message: "Venom sent requires a proteins list" })


    const species = this;

    species.venom.proteins = []
    return species.save()
        .then(() => {
            return species.addVenom(venom)
        })
}

/**
 * Add outlinks to a species
 * @param {Array} out_links an array of out_links objects
 */
SpeciesSchema.methods.addOutLinks = function (out_links) {

    const species = this;
    if ((out_links.constructor === Array)) {
        out_links.forEach(element => {
            species.out_links.push(element)
        });
        return species.save()
    } else {
        return Promise.reject({ message: "Out links field should be an array" })
    }
}

/**
 * Update outlinks to a species
 * @param {Array} out_links an array of out_links objects
 */
SpeciesSchema.methods.updateOutLinks = function (out_links) {
    if (!(out_links.constructor === Array)) {
        return Promise.reject({ message: "Out link not a list" })
    }

    const species = this;

    species.out_links = []
    if (out_links.length === 0)
        return species.save()
    return species.save()
        .then(() => {
            return species.addOutLinks(out_links)
        })
}

const Species = mongoose.model('Species', SpeciesSchema);

//========================================
// GET
//========================================


/**
 * returns all the species
 */
Species.getAll = () => {
    return new Promise((resolve, reject) => {
        Species.find({})
            .exec((err, species) => {
                if (err) reject(err)
                resolve(species)
            })
    })
}

/**
 * Get an species given its venomkb_id
 * @param {String} venomkb_id venomkb_id of the species to get
 * @param {String} path path to populate (leave blank if none)
 */
Species.getByVenomKBId = (venomkb_id, path) => {
    return new Promise((resolve, reject) => {
        Species.findOne({ venomkb_id: venomkb_id })
            .populate(path || '')
            .exec((err, species) => {
                if (err) {
                    reject(err);
                }
                resolve(species);
            });
    });
};


/**
 * Get an species given its id
 * @param {ObjectId} id  id of the species to get
 * @param {String} path path to populate (leave blank if none)
 */
Species.getById = (id, path) => {
    return new Promise((resolve, reject) => {
        Species.findOne({ _id: id })
            .populate(path || '')
            .exec((err, species) => {
                if (err) {
                    reject(err);
                }
                resolve(species);
            });
    });
};

/**
 * Get an species given its name
 * @param {String} name  name of the Species to get
 * @param {String} path path to populate (leave blank if none)
 */
Species.getByName = (name, path) => {
    return new Promise((resolve, reject) => {
        Species.findOne({ $text: { $search: name } })
            .populate(path || '')
            .exec((err, species) => {
                if (err) {
                    reject(err);
                }
                resolve(species);
            });
    });
};

//========================================
// ADD
//========================================

/**
 * Add a species to the database
 * @param {Object} new_species to be added
 */
Species.add = new_species => {
    return new Promise((resolve, reject) => {
        Species.create(new_species, (err, created_species) => {
            if (err) reject(err)
            resolve(created_species)
        })
    })
}


//========================================
// UPDATE
//========================================
/**
 * Update a species to the database
 * @param {Object} updated_species
 */
Species.update = (venomkb_id, updated_species) => {
    return Species.findOneAndUpdate({ venomkb_id: venomkb_id }, updated_species).exec()
}

//========================================
// DELETE
//========================================

/**
 * Delete a species
 * @param {ObjectId} id species id who needs to be removed from the
 */
Species.delete = id => {
    return new Promise((resolve, reject) => {
        Species.getById(id).then(species => {
            if (!species) {
                reject({ status: "Empty" })
            }
            species.remove(err => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
    })
}


module.exports = Species;


