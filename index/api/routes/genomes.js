const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const genome = require('../models/Genome.js');
const Genome = require('../models/Genome.js');

const vkbid_reg = /G\d{7}/;

/**
 * Get a list of all genomes
 * @returns an array of genome object
 */
/* GET /genomes listing. */
router.get('/', (req, res, next) => {
  Genome.getAll()
    .then(genomes => {
      res.json(genomes)
    })
    .catch(err => {
      return sendStatusMessage(res, 500, err.message);
    })
});

/* GET /genomes/index */
router.get('/index', (req, res, next) => {
  genome.find({}, {venomkb_id: 1, name: 1, venom_ref: 1}).exec((err, genomes_ind) => {
    if (err) return next(err);
    res.json(genomes_ind);
  });
});

/**
 * Find all genome that have a given pattern in their name
 * @param {Query} name full name or part of the name of the genome
 * @returns the genome if only one result, an array of genome object in other case
 */
/* GET /genomes/name */
router.get('/search', (req, res, next) => {
  if (!req.query.name) {
    console.log("You must enter a name");
    return utils.sendStatusMessage(res, 400, "genome name not specified")

  }
  console.log("Find by name");
  Genome.getByName(req.query.name)
    .then(genome => {
      res.json(genome)
    })
    .catch(err => {
      return sendStatusMessage(res, 500, err.message);
    })
});

/**
 * Find a genome given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the genome
 * @returns the genome
 */
/* GET /genomes/id */
router.get('/:id', (req, res, next) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, "genome id not specified")
  }
  if (vkbid_reg.test(req.params.id)) {
    console.log("Find by VenomKB id");
    Genome.getByVenomKBId(req.params.id)
      .then(genome => {
        res.json(genome)
      })
      .catch()
  } else {
    console.log("Find by id");
    Genome.getById(req.params.id)
      .then(genome => {
        res.json(genome)
      })
      .catch(err => {
        return sendStatusMessage(res, 500, err.message);
      })
  }
});


/* POST /genomes */
router.post('/', (req, res, next) => {
  genome.create(req.body,  (err, genomes) => {
    if (err) return next(err);
    console.log('New genome created:');
    console.log(genomes);
    res.json(genomes);
  });
});

/* PUT /genomes/:id */
router.put('/:id', (req, res, next) => {
  genome.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(genomes);
  });
});

/* DELETE /genomes/:id */
router.delete('/:id', (req, res, next) => {
  genome.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    console.log('genome deleted:');
    console.log(genomes);
    res.json(genomes);
  });
});

module.exports = router;
