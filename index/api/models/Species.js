const mongoose = require('mongoose');


const VenomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proteins: [{ type: mongoose.Schema.ObjectId, ref: 'Protein', required: true }],
});


const SpeciesSchema = new mongoose.Schema({
    venomkb_id: { type: String, index:true },
    lastUpdated: {type: Date, required: true},
    name: {type: String, required: true, unique:true},
    commom_name: String,
    venom_ref: {type: String, required: true},
    annotation_score: {type:Number, min:1, max:5, required:true},
    species_image_url: String,
    venom: VenomSchema,
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    taxonomic_lineage: [{ type: mongoose.Schema.ObjectId, ref: 'Taxonomic' }],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
});

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
        Species.find({ $text: { $search: name } })
            .populate(path || '')
            .exec((err, species) => {
                if (err) {
                    reject(err);
                }
                console.log(species.length);

                resolve(species);
            });
    });
};

module.exports = Species;




