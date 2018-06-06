const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const GenomeSchema = new mongoose.Schema({
    venomkb_id: {type: String, index:true, unique: true},
    species: String,
    lastUpdates: {type: Date, required: true},
    assembly_platform: String,
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    project_homepage: String,
    name: {type: String, required: true},
    literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
});


const Genome = mongoose.model('Genome', GenomeSchema);

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
 * @param {String} path path to populate (leave blank if none)
 */
Genome.getByVenomKBId = (venomkb_id, path) => {
    return new Promise((resolve, reject) => {
        Genome.findOne({ venomkb_id: venomkb_id })
            .populate(path || '')
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
 * @param {String} path path to populate (leave blank if none)
 */
Genome.getById = (id, path) => {
    return new Promise((resolve, reject) => {
        Genome.findOne({ _id: id })
            .populate(path || '')
            .exec((err, genome) => {
                if (err) {
                    reject(err);
                }
                resolve(genome);
            });
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
                console.log(genomes.length);

                resolve(genomes);
            });
    });
};

module.exports = Genome;
