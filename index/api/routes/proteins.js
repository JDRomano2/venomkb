const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const protein = require('../models/Protein.js');
const Protein = require('../models/Protein.js');
const utils = require("../utils.js")


const vkbid_reg = /P\d{7}/;

/**
 * Get a list of all proteins
 * @returns an array of protein object
 */
/* GET /proteins listing. */
router.get('/', (req, res, next) => {
    Protein.getAll()
        .then(proteins => {
            res.json(proteins)
        })
        .catch(err => {
            return utils.sendStatusMessage(res, 500, err.message);
        })
});

/* GET /proteins/index */
router.get('/index', (req, res, next) => {
    protein.find({}, { venomkb_id: 1, name: 1, venom_ref: 1 }).exec((err, proteins_ind) => {
        if (err) return next(err);
        res.json(proteins_ind);
    });
});


/**
 * Find all protein that have a given pattern in their name
 * @param {Query} name full name or part of the name of the protein
 * @returns the protein if only one result, an array of protein object in other case
 */
/* GET /proteins/name */
router.get('/search', (req, res, next) => {
    if (!req.query.name) {
        console.log("You must enter a name");
        return utils.sendStatusMessage(res, 400, "protein name not specified")

    }
    console.log("Find by name");
    Protein.getByName(req.query.name)
        .then(protein => {
            res.json(protein)
        })
        .catch(err => {
            return utils.sendStatusMessage(res, 500, err.message);
        })
});

/**
 * Find all protein that have a given pattern in their name and return the number
 * @param {Query} name full name or part of the name of the protein
 * @returns the number of protein matched
 */
/* GET /proteins/name */
router.get('/count', (req, res, next) => {
    if (!req.query.name) {
        console.log("You must enter a name");
        return utils.sendStatusMessage(res, 400, "protein name not specified")

    }
    console.log("Find by name");
    Protein.getByName(req.query.name)
        .then(proteins => {
            res.json(proteins.length)
        })
        .catch(err => {
            return utils.sendStatusMessage(res, 500, err.message);
        })
});

/**
 * Find a protein given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the protein
 * @returns the protein
 */
/* GET /proteins/id */
router.get('/:id', (req, res, next) => {
    if (!req.params.id) {
        return utils.sendStatusMessage(res, 400, "protein id not specified")
    }
    if (vkbid_reg.test(req.params.id)) {
        console.log("Find by VenomKB id");
        Protein.getByVenomKBId(req.params.id)
            .then(protein => {
                res.json(protein)
            })
            .catch()
    } else {
        console.log("Find by id");
        Protein.getById(req.params.id)
            .then(protein => {
                res.json(protein)
            })
            .catch(err => {
                return utils.sendStatusMessage(res, 500, err.message);
            })
    }
});

/**
     * Create new protein
     * @param {Body} name
     * @param {Body} description
    */
router.post("/", function (req, res) {
    // Check if all the necessary fields are there

    if (!req.body.name) {
        return utils.sendStatusMessage(res, 400, "The name field is empty")
    }
    if (!req.body.venomkb_id) {
        return utils.sendStatusMessage(res, 400, "The venomkb_id field is empty")
    }
    if (!req.body.lastUpdated) {
        return utils.sendStatusMessage(res, 400, "The lastUpdated field is empty")
    }
    if (!req.body.venom_ref) {
        return utils.sendStatusMessage(res, 400, "The venom_ref field is empty")
    }

    if (typeof req.body.pdb_structure_known === Boolean) {
        return utils.sendStatusMessage(res, 400, "The pdb_structure_know field is empty")
    }
    if (!req.body.annotation_score) {
        return utils.sendStatusMessage(res, 400, "The annotation score field is empty")
    }

    // Check if the protein already exists
    return Protein.getByVenomKBId(req.body.venomkb_id)
        .then(protein => {
            console.log("try to find protein", protein);

            if (protein) {
                return Promise.reject({ message: "venomkb_id already exists" })
            }
        })
        .then(() => {
            // Create a new protein
            var new_protein = {
                name: req.body.name,
                lastUpdated: req.body.lastUpdated,
                venomkb_id: req.body.venomkb_id,
                common_name: req.body.common_name,
                venom_ref: req.body.venom_ref,
                annotation_score: req.body.annotation_score,
                pdb_structure_known: req.body.pdb_structure_known,
                description: req.body.description,
                aa_sequence: req.body.aa_sequence,
                pdb_image_url: req.body.pdb_image_url
            }
            return Protein.add(new_protein)
        })
        .then((new_protein) => {
            // add out links
            if (req.body.out_links) {
                return new_protein.addOutLinks(req.body.out_links)
            } else {
                return Promise.resolve(new_protein);
            }
        })
        .then((new_protein) => {
            // add literature predication
            if (req.body.literature_predications) {
                return new_protein.addLiterature(req.body.literature_predications)
            } else {
                return Promise.resolve(new_protein);
            }
        })
        .then((new_protein) => {
            // add literature reference
            if (req.body.literature_references) {
                return new_protein.addReference(req.body.literature_references)
            } else {
                return Promise.resolve(new_protein);
            }
        })
        .then((new_protein) => {
            // add go annotation
            if (req.body.go_annotations) {
                return new_protein.addGOAnnotation(req.body.go_annotations)
            } else {
                return Promise.resolve(new_protein);
            }
        })
        .then(() => {
            res.sendStatus(200)
        })
        .catch((err) => {
            utils.sendErrorMessage(res, err);
        })
})

/**
 * Update a protein
 * @param {Body} name
 * @param {Body} description
*/
router.post("/update/:id", function (req, res) {
    // Check if all the necessary fields are there

    if (!req.body.name) {
        return utils.sendStatusMessage(res, 400, "The name field is empty")
    }
    if (!req.body.venomkb_id) {
        return utils.sendStatusMessage(res, 400, "The venomkb_id field is empty")
    }
    if (!req.body.lastUpdated) {
        return utils.sendStatusMessage(res, 400, "The lastUpdated field is empty")
    }
    if (!req.body.venom_ref) {
        return utils.sendStatusMessage(res, 400, "The venom_ref field is empty")
    }

    if (typeof req.body.pdb_structure_known === Boolean) {
        return utils.sendStatusMessage(res, 400, "The pdb_structure_know field is empty")
    }
    if (!req.body.annotation_score) {
        return utils.sendStatusMessage(res, 400, "The annotation score field is empty")
    }

    // Check if the protein already exists
    return Protein.getByVenomKBId(req.body.venomkb_id)

        .then(protein => {

            if (!protein) {
                return Promise.reject({ message: "Protein not found, cannot update a protein that doesn't exist" })
            }
        })
        .then(() => {

            // Create a new protein
            var new_protein = {
                name: req.body.name,
                lastUpdated: req.body.lastUpdated,
                venomkb_id: req.body.venomkb_id,
                common_name: req.body.common_name,
                venom_ref: req.body.venom_ref,
                annotation_score: req.body.annotation_score,
                pdb_structure_known: req.body.pdb_structure_known,
                description: req.body.description,
                aa_sequence: req.body.aa_sequence,
                pdb_image_url: req.body.pdb_image_url
            }
            return Protein.update(req.body.venomkb_id, new_protein)
        })
        .then((new_protein) => {

            // add out links
            if (req.body.out_links) {
                return new_protein.updateOutLinks(req.body.out_links)
            } else {
                return new_protein.updateOutLinks([])
            }
        })
        .then((new_protein) => {
            // add literature predication
            if (req.body.literature_predications) {
                return new_protein.updateLiterature(req.body.literature_predications)
            } else {
                return new_protein.updateLiterature([])
            }
        })
        .then((new_protein) => {
            // add literature reference
            if (req.body.literature_references) {
                return new_protein.updateReference(req.body.literature_references)
            } else {
                return new_protein.updateReference([])
            }
        })
        .then((new_protein) => {
            // add go annotation
            if (req.body.go_annotations) {
                return new_protein.updateGOAnnotation(req.body.go_annotations)
            } else {
                return new_protein.updateGOAnnotation([])
            }
        })
        .then(() => {
            res.sendStatus(200)
        })
        .catch((err) => {
            utils.sendErrorMessage(res, err);
        })
})





/* GET /species/index */
router.get('/index', (req, res, next) => {
    species.find({}, { venomkb_id: 1, name: 1 }).exec((err, species_ind) => {
        if (err) return next(err);
        res.json(species_ind);
    });
});



/* POST /proteins */
router.post('/', (req, res, next) => {
    protein.create(req.body, (err, proteins) => {
        if (err) return next(err);
        res.json(proteins);
    });
});






/* PUT /proteins/:id */
router.put('/:id', (req, res, next) => {
    protein.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
        if (err) return next(err);
        res.json(proteins);
    });
});

/* DELETE /proteins/:id */
router.delete('/:id', (req, res, next) => {
    protein.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
        if (err) return next(err);
        console.log('protein deleted:');
        console.log(proteins);
        res.json(proteins);
    });
});

module.exports = router;
