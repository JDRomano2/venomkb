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
            return sendStatusMessage(res, 500, err.message);
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
            return sendStatusMessage(res, 500, err.message);
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
            return sendStatusMessage(res, 500, err.message);
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
                return sendStatusMessage(res, 500, err.message);
            })
    }
});

/* POST /proteins */
router.post('/', (req, res, next) => {
    protein.create(req.body, (err, proteins) => {
        if (err) return next(err);
        console.log('New protein created:');
        console.log(proteins);
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
