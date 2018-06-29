const mongoose = require('mongoose');
const Species = require('./Species');
const OutLink = require('./Outlink');


// Schema to enforce consistent structure.
const VenomSeqSchema = new mongoose.Schema({
    venomkb_id: { type: String, index: true },
    lastUpdated: { type: Date, default: Date.now},
    name: { type: String, required: true },
    species_ref: { type: mongoose.Schema.ObjectId, ref: 'Species' },
    dosage: Number,
    cell_line: String,
    time_exposed: [Number],
    genes_up: [String],
    genes_down: [String],
    raw_data: String,
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});

/**
 * Add outlinks to a venom_seq
 * @param {Array} out_links an array of out_links objects
 */
VenomSeqSchema.methods.addOutLink = function (out_links) {
    const venom_seq = this;
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
                        venom_seq.out_links.push(out_link._id);
                        resolve();
                    }).catch(reject)
                }
                return OutLink.add(element)
                    .then((out_link) => {
                        venom_seq.out_links.push(out_link._id);
                        resolve();
                    }).catch(reject)

            }))
        })
        return Promise.all(promises).then(() => {
            return venom_seq.save()
        });
    } else {
        return Promise.reject({ message: "Out links field should be an array" })
    }
}

/**
 * Add species references to a venom_seq
 * @param {String} species_venomkb_id the venomkb_id of the species
*/
VenomSeqSchema.methods.addSpecies = function (species_venomkb_id) {
    if (!species_venomkb_id) {
        return Promise.reject({ message: "Need a species venomkb_id" })
    }

    const venom_seq = this;
    Species.getByVenomKBId(species_venomkb_id)
        .then((species) => {
            if (species) {
                venom_seq.species_ref = species._id
                return venom_seq.save()
            }
            else {
                return Promise.reject({ message: "Species not found" })
            }
        }
        )

}

/**
 * Add genes up to a venom_seq
 * @param {Array} genes_up
*/
VenomSeqSchema.methods.addGenesUp = function (genes_up) {
    const venom_seq = this;
    if ((genes_up instanceof Array)) {
            genes_up.forEach(element => {
                venom_seq.genes_up.push(element)
            });
            return venom_seq.save()
    } else {
        return Promise.reject({ message: "Genes up field should be an array" })
    }

}

/**
 * Add genes down to a venom_seq
 * @param {Array} genes_down
*/
VenomSeqSchema.methods.addGenesDown = function (genes_down) {
    const venom_seq = this;
    if ((genes_down instanceof Array)) {
        genes_down.forEach(element => {
            venom_seq.genes_down.push(element)
        });
        return venom_seq.save()
    } else {
        return Promise.reject({ message: "Genes down field should be an array" })
    }

}


const VenomSeq = mongoose.model('VenomSeq', VenomSeqSchema);

//========================================
// GET
//========================================



/**
 * returns all the venom_seqs
 */
VenomSeq.getAll = () => {
    return new Promise((resolve, reject) => {
        VenomSeq.find({})
            .exec((err, venom_seqs) => {
                if (err) reject(err)
                resolve(venom_seqs)
            })
    })
}

/**
 * Get an venom_seq given its venomkb_id
 * @param {ObjectId} id  id of the venom_seq to get
 * @param {String} path path to populate (leave blank if none)
 */
VenomSeq.getByVenomKBId = (venomkb_id, path) => {
    return new Promise((resolve, reject) => {
        VenomSeq.findOne({ venomkb_id: venomkb_id })
            .populate(path || '')
            .exec((err, venom_seq) => {
                if (err) {
                    reject(err);
                }
                resolve(venom_seq);
            });
    });
};


/**
 * Get an venom_seq given its id
 * @param {ObjectId} id  id of the venom_seq to get
 * @param {String} path path to populate (leave blank if none)
 */
VenomSeq.getById = (id, path) => {
    return new Promise((resolve, reject) => {
        VenomSeq.findOne({ _id: id })
            .populate(path || '')
            .exec((err, venom_seq) => {
                if (err) {
                    reject(err);
                }
                resolve(venom_seq);
            });
    });
};

/**
 * Get an array of venom_seq index
 */
VenomSeq.getIndex = () => {
    return new Promise((resolve, reject) => {
        VenomSeq.find({}, { venomkb_id: 1, name: 1 })
            .exec((err, venom_seqs) => {
                if (err) {
                    reject(err)
                }
                resolve(venom_seqs)
            })
    });
};

/**
 * Get an venom_seq given its name
 * @param {String} name  name of the venom_seq to get
 * @param {String} path path to populate (leave blank if none)
 */
VenomSeq.getByName = (name, path) => {
    return new Promise((resolve, reject) => {
        VenomSeq.find({ $text: { $search: name } })
            .populate(path || '')
            .exec((err, venom_seqs) => {
                if (err) {
                    reject(err);
                }
                resolve(venom_seqs);
            });
    });
};


//========================================
// ADD
//========================================

/**
 * Add a venom_seq to the database
 * @param {Object} new_venom_seq to be added
 */
VenomSeq.add = new_venom_seq => {
    return new Promise((resolve, reject) => {
        VenomSeq.create(new_venom_seq, (err, created_venom_seq) => {
            if (err) reject(err)
            resolve(created_venom_seq)
        })
    })
}
module.exports = VenomSeq;
