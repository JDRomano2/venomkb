const mongoose = require('mongoose');
const Reference = require('./Reference');
const Species = require('./Species');
const OutLink = require('./Outlink');


// Schema to enforce consistent structure.
const GenomeSchema = new mongoose.Schema({
    lastUpdated: { type: Date, default: Date.now},
    venomkb_id: { type: String, index: true },
    name: { type: String, required: true },
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    species_ref: String,
    assembly_platform: String,
    project_homepage: String,
    literature_reference: { type: mongoose.Schema.ObjectId, ref: 'Reference' },
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});

/**
 * Add outlinks to a genome
 * @param {Array} out_links an array of out_links objects
 */
GenomeSchema.methods.addOutLink = function (out_links) {
    const genome = this;
    if ((out_links.constructor === Array)) {
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
                        genome.out_links.push(out_link._id);
                        resolve();
                    }).catch(reject)
                }
                return OutLink.add(element)
                    .then((out_link) => {
                        genome.out_links.push(out_link._id);
                        resolve();
                    }).catch(reject)

            }))
        })
        return Promise.all(promises).then(() => {
            return genome.save()
        });
    } else {
        return Promise.reject({ message: "Out links field should be an array" })
    }
}

/**
 * Add literature references to a genome
 * @param {Array} references an array of literature_reference objects
 */
GenomeSchema.methods.addReference = function (reference) {
    const genome = this;

    if (typeof reference == "object") {
        return Reference.add(reference)
            .then((new_reference) => {
                genome.literature_reference = new_reference._id;
                return genome.save()
            })
    } else {
        return Promise.reject({ message: "Reference must be an object" })
    }
}

/**
 * Add species references to a genome
 * @param {String} species_venomkb_id the venomkb_id of the species
*/
GenomeSchema.methods.addSpecies = function (species_venomkb_id) {
    if (!species_venomkb_id) {
        return Promise.reject({ message: "Need a species venomkb_id" })
    }

    const genome = this;
    Species.getByVenomKBId(species_venomkb_id)
        .then((species) => {
            if (species) {
                genome.species_ref = species._id
                return genome.save()
            }
            else {
                return Promise.reject({ message: "Species not found" })
            }
        }
        )

}

const Genome = mongoose.model('Genome', GenomeSchema);

//========================================
// GET
//========================================



/**
 * returns all the genomes
 */
Genome.getAll = () => {
    return new Promise((resolve, reject) => {
        Genome.find({})
            .exec((err, genomes) => {
                if (err) reject(err)
                resolve(genomes)
            })
    })
}

/**
 * Get an genome given its venomkb_id
 * @param {ObjectId} id  id of the genome to get
 */
Genome.getByVenomKBId = (venomkb_id) => {
    return new Promise((resolve, reject) => {
        Genome.findOne({ venomkb_id: venomkb_id })
            .populate("out_links species_ref, literature_reference")
            .exec((err, genome) => {
                if (err) {
                    reject(err);
                }
                resolve(genome);
            });
    });
};


/**
 * Get an genome given its id
 * @param {ObjectId} id  id of the genome to get
 */
Genome.getById = (id) => {
    return new Promise((resolve, reject) => {
        Genome.findOne({ _id: id })
            .populate("out_links species_ref, literature_reference")
            .exec((err, genome) => {
                if (err) {
                    reject(err);
                }
                resolve(genome);
            });
    });
};

/**
 * Get an array of genome index
 */
Genome.getIndex = () => {
    return new Promise((resolve, reject) => {
        Genome.find({}, { venomkb_id: 1, name: 1, annotation_score: 1 })
            .exec((err, genomes) => {
                if (err) {
                    reject(err)
                }
                resolve(genomes)
            })
    });
};

/**
 * Get an genome given its name
 * @param {String} name  name of the genome to get
 * @param {String} path path to populate (leave blank if none)
 */
Genome.getByName = (name, path) => {
    return new Promise((resolve, reject) => {
        Genome.find({ $text: { $search: name } })
            .populate(path || '')
            .exec((err, genomes) => {
                if (err) {
                    reject(err);
                }
                resolve(genomes);
            });
    });
};


//========================================
// ADD
//========================================

/**
 * Add a genome to the database
 * @param {Object} new_genome to be added
 */
Genome.add = new_genome => {
    return new Promise((resolve, reject) => {
        Genome.create(new_genome, (err, created_genome) => {
            if (err) reject(err)
            resolve(created_genome)
        })
    })
}
module.exports = Genome;
