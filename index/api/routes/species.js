const express = require('express');
const router = express.Router();
const species = require('../models/Species.js');
const Species = require('../models/Species.js');
const utils = require("../utils.js")


const vkbid_reg = /S\d{7}/;

/**
 * Get a list of all species
 * @returns an array of species object
 */
/* GET /species listing. */
router.get('/', (req, res, next) => {
    Species.getAll()
        .then(species => {
            res.json(species)
        })
        .catch(err => {
            return sendStatusMessage(res, 500, err.message);
        })
});

/**
 * Find all species that have a given pattern in their name
 * @param {Query} name full name or part of the name of the species
 * @returns the species if only one result, an array of species object in other case
 */
/* GET /species/name */
router.get('/search', (req, res, next) => {
    if (!req.query.name) {
        console.log("You must enter a name");
        return utils.sendStatusMessage(res, 400, "species name not specified")

    }
    console.log("Find by name");
    Species.getByName(req.query.name)
        .then(species => {
            res.json(species)
        })
        .catch(err => {
            return sendStatusMessage(res, 500, err.message);
        })
});

/**
 * Find all species that have a given pattern in their name
 * @param {Query} name full name or part of the name of the species
 * @returns the number of species matched
 */
/* GET /species/name */
router.get('/search', (req, res, next) => {
    if (!req.query.name) {
        console.log("You must enter a name");
        return utils.sendStatusMessage(res, 400, "species name not specified")

    }
    console.log("Find by name");
    Species.getByName(req.query.name)
        .then(species => {
            res.json(species.length)
        })
        .catch(err => {
            return sendStatusMessage(res, 500, err.message);
        })
});
/**
 * Find a species given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the species
 * @returns the species
 */
/* GET /species/id */
router.get('/:id', (req, res, next) => {
    if (!req.params.id) {
        return utils.sendStatusMessage(res, 400, "species id not specified")
    }
    if (vkbid_reg.test(req.params.id)) {
        console.log("Find by VenomKB id");
        Species.getByVenomKBId(req.params.id)
            .then(species => {
                res.json(species)
            })
            .catch()
    } else {
        console.log("Find by id");
        Species.getById(req.params.id)
            .then(species => {
                res.json(species)
            })
            .catch(err => {
                return sendStatusMessage(res, 500, err.message);
            })
    }
});

/**
 * Create new species
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
     if (!req.body.venom.name) {
        return utils.sendStatusMessage(res, 400, "The venom name field is empty")
    }
    if (!req.body.annotation_score) {
        return utils.sendStatusMessage(res, 400, "The annotation score field is empty")
    }
    if (!req.body.venom.proteins) {
        return utils.sendStatusMessage(res, 400, "The venom protein field is empty")
    }

    // Check if the species already exists
    return Species.getByName(req.body.name)
        .then(species => {
            console.log("try to find species", species);

            if (species) {
                return utils.sendStatusMessage(res, 400, "Species name already exists")
            }
        })
        .then(() => {
            // Create a new species
            return Species.add({
                name: req.body.name,
                lastUpdated: req.body.lastUpdated,
                venomkb_id: req.body.venomkb_id,
                common_name: req.body.common_name,
                venom_ref: req.body.venom_ref,
                annotation_score: req.body.annotation_score,
                "venom.name": req.body.venom.name
            })
        })
        .then((new_species) => {
            // add taxonomic lineage
            if (req.body.taxonomic) {
                return new_species.addTaxonomic(req.body.taxonomic)
            } else {
                return Promise.resolve(new_species);
            }
        })
        .then((new_species) => {
            // add venom
            if (req.body.venom) {
                return new_species.addVenom(req.body.venom)
            } else {
                return Promise.resolve(new_species);
            }
        })
        .then((new_species) => {
            // add out links
            if (req.body.out_links) {
                return new_species.addOutLinks(req.body.out_links)
            } else {
                return Promise.resolve(new_species);
            }
        })
        .then((new_species) => {
            // add out links
            if (req.body.literature_predications) {
                return new_species.addLiterature(req.body.literature_predications)
            } else {
                return Promise.resolve(new_species);
            }
        })
        .then(() => {
            res.sendStatus(200)
        })
        .catch((err) => {
            utils.sendErrorMessage(res, err);
        })
})

/* POST /species */
router.post('/', (req, res, next) => {
    species.create(req.body, (err, spec) => {
        if (err) return next(err);
        console.log('New species created:');
        console.log(spec);
        res.json(spec);
    });
});

/* GET /species/index */
router.get('/index', (req, res, next) => {
    species.find({}, { venomkb_id: 1, name: 1 }).exec((err, species_ind) => {
        if (err) return next(err);
        res.json(species_ind);
    });
});


/* GET /species/id */
router.get('/:id', (req, res, next) => {
    if (vkbid_reg.test(req.params.id)) {
        console.log("Find by VenomKB id");
        species.find({ 'venomkb_id': req.params.id }, (err, spec) => {
            if (err) return handleError(err);
            res.json(spec);
        });
    } else {
        console.log("Find by id");
        species.findById(req.params.id, (err, spec) => {
            if (err) return next(err);
            res.json(spec);
        });
    }
});

// /* PUT /species/:id */
// router.put('/:id', (req, res, next) => {
//     species.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
//         if (err) return next(err);
//         res.json(species);
//    });
//
//
// * DELETE /species/:id */
// uter.delete('/:id', (req, res, next) => {
//   species.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
//       if (err) return next(err);
//      console.log('species deleted:');
//       console.log(species);
//       res.json(species);
//   });
// ;

module.exports = router;
