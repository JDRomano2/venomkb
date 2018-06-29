const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const genome = require('../models/Genome.js');
const Genome = require('../models/Genome.js');
const utils = require("../utils.js")

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
      return utils.sendStatusMessage(res, 500, err.message);
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
      return utils.sendStatusMessage(res, 500, err.message);
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
    console.log("Find by VenomKB id", req.query);
    Genome.getByVenomKBId(req.params.id, req.query.populate)
      .then(genome => {
        res.json(genome)
      })
      .catch()
  } else {
    console.log("Find by id");
    Genome.getById(req.params.id, req.query.populate)
      .then(genome => {
        res.json(genome)
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      })
  }
});


/**
 * Create new genome
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
  if (!req.body.annotation_score) {
    return utils.sendStatusMessage(res, 400, "The annotation score field is empty")
  }

  // Check if the genome already exists
  return Genome.getByVenomKBId(req.body.venomkb_id)
    .then(genome => {
      console.log("try to find genome", genome);

      if (genome) {
        return Promise.reject({ message: "venomkb_id already exists" })
      }
    })
    .then(() => {
      // Create a new genome
      var new_genome = {
        name: req.body.name,
        lastUpdated: req.body.lastUpdated,
        venomkb_id: req.body.venomkb_id,
        annotation_score: req.body.annotation_score,
        assembly_platform: req.body.assembly_platform,
        project_homepage: req.project_homepage
      }
      return Genome.add(new_genome)
    })
    .then((new_genome) => {
      // add literature reference
      if (req.body.literature_reference) {
        return new_genome.addReference(req.body.literature_reference)
      } else {
        return Promise.resolve(new_genome);
      }
    })
    .then((new_genome) => {
      // add literature reference
      if (req.body.out_links) {
        return new_genome.addOutLink(req.body.out_links)
      } else {
        return Promise.resolve(new_genome);
      }
    })
    .then((new_genome) => {
      // add literature reference
      if (req.body.species_ref) {
        return new_genome.addSpecies(req.body.species_ref)
      } else {
        return Promise.resolve(new_genome);
      }
    })
    .then(() => {
      res.sendStatus(200)
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    })
})

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
