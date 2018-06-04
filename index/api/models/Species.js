const mongoose = require('mongoose');
const Taxonomic = require('./Taxonomic');
const Protein = require('./Protein');
const OutLink = require('./Outlink');
const Literature = require('./Literature');

const SpeciesSchema = new mongoose.Schema({
    venomkb_id: { type: String, index:true },
    lastUpdated: {type: Date, required: true},
    name: {type: String, required: true, unique:true},
    commom_name: String,
    venom_ref: {type: String, required: true},
    annotation_score: {type:Number, min:1, max:5, required:true},
    species_image_url: String,
    venom: {
        name: {type: String, required: true},
        proteins: [{ type: mongoose.Schema.ObjectId, ref: 'Protein' }],

    },
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    taxonomic_lineage: [{ type: mongoose.Schema.ObjectId, ref: 'Taxonomic' }],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
});

SpeciesSchema.methods.addTaxonomic = function(taxonomic) {
    // Test wether taxonomic is a list of object ids or objects
    if (!(taxonomic.constructor === Array)) {
        return Promise.reject({message: "Taxonomic not a list"})
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
                        console.log(species.taxonomic_lineage);

                        resolve();
                    })
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

SpeciesSchema.methods.addVenom = function(venom) {
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
                        reject({message: "The protein venomkbId: " + element + " was not found in the database ... Please add it before"})
                    }
                    species.venom.proteins.push(protein._id)
                    console.log(species.venom.proteins);

                    resolve();
                })
            }))
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        return Promise.reject({message: "Proteins field should be an array"})
    }
}

SpeciesSchema.methods.addOutLinks = function (out_links) {
    // Test wether venom is a object
    console.log("out link", typeof out_links, out_links);


    const species = this;

    // Add proteins
    if ((out_links.constructor === Array)) {
        const promises = [];
        out_links.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                return OutLink.findOne(element).then((el) => {
                    if (el) {
                        return Promise.reject({ message: "Out links already exists :"+element.primary_id+" "+element.ressource });
                    } else {
                        return OutLink.add(element);
                    }
                }).then((out_link) => {
                    species.out_links.push(out_link._id);
                    console.log(species.out_links);
                    resolve();
                })
            }))
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        return Promise.reject({ message: "Out links field should be an array" })
    }
}

SpeciesSchema.methods.addLiterature = function (literatures) {
    if (!(literatures.constructor === Array)) {
        return Promise.reject({ message: "Literatures not a list" })
    }

    const species = this;

    if (typeof literatures[0] == "object") {
        const promises = [];
        literatures.forEach(element => {
            promises.push(new Promise((resolve, reject) => {
                return Literature.add(element)
                .then((literature) => {
                    species.literature_predications.push(literature._id);
                    console.log(species.literature_predications);
                    resolve();
                })
            })
            )
        })
        return Promise.all(promises).then(() => {
            return species.save()
        });
    } else {
        return Promise.reject({ message: "Literatures list must contain object" })
    }
}

const Species = mongoose.model('Species', SpeciesSchema);

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
    console.log("enter add fonction");

    return new Promise((resolve, reject) => {
        Species.create(new_species, (err, created_species) => {
            if (err) reject(err)
            console.log("created species", created_species);

            resolve(created_species)
        })
    })
}


module.exports = Species;


