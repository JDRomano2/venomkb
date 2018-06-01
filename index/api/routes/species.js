const express = require('express');
const router = express.Router();
const species = require('../models/Species.js');
const Species = require('../models/Species.js');

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
