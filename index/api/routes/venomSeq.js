const express = require('express');
const router = express.Router();
const VenomSeq = require('../models/VenomSeq.js');
const utils = require('../utils.js');

const vkbid_reg = /Q\d{7}/;

/**
 * Get a list of all venom_seqs
 * @returns an array of venom_seq object
 */
/* GET /venom_seqs listing. */
router.get('/', (req, res) => {
  VenomSeq.getAll()
    .then(venom_seqs => {
      res.json(venom_seqs);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/* GET /venom_seqs/index */
router.get('/index', (req, res, next) => {
  Venom_seq.find({}, { venomkb_id: 1, name: 1, venom_ref: 1 }).exec((err, venom_seqs_ind) => {
    if (err) return next(err);
    res.json(venom_seqs_ind);
  });
});

/**
 * Find all venom_seq that have a given pattern in their name
 * @param {Query} name full name or part of the name of the venom_seq
 * @returns the venom_seq if only one result, an array of venom_seq object in other case
 */
/* GET /venom_seqs/name */
router.get('/search', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'venom_seq name not specified');
  }
  VenomSeq.getByName(req.query.name)
    .then(venom_seq => {
      res.json(venom_seq);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find a venom_seq given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the venom_seq
 * @returns the venom_seq
 */
/* GET /venom_seqs/id */
router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'venom_seq id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    VenomSeq.getByVenomKBId(req.params.id)
      .then(venom_seq => {
        res.json(venom_seq);
      })
      .catch();
  } else {
    VenomSeq.getById(req.params.id)
      .then(venom_seq => {
        res.json(venom_seq);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});


/**
 * Create new venom_seq
 * @param {Body} name
 * @param {Body} description
*/
router.post('/', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.body.name) {
    return utils.sendStatusMessage(res, 400, 'The name field is empty');
  }
  if (!req.body.venomkb_id) {
    return utils.sendStatusMessage(res, 400, 'The venomkb_id field is empty');
  }

  // Check if the venom_seq already exists
  return VenomSeq.getByVenomKBId(req.body.venomkb_id)
    .then(venom_seq => {
      if (venom_seq) {
        return Promise.reject({ message: 'venomkb_id already exists' });
      }
    })
    .then(() => {
      // Create a new venom_seq
      var new_venom_seq = {
        name: req.body.name,
        venomkb_id: req.body.venomkb_id,
        dosage: req.body.dosage,
        cell_line: req.body.cell_line,
        raw_data: req.body.raw_data,
        dosage_unit: req.body.dosage_unit,
        species_ref: req.body.species_ref
      };
      return VenomSeq.add(new_venom_seq);
    })
    .then((new_venom_seq) => {
      // add genes_up
      if (req.body.genes_up && req.body.genes_up.length>0) {
        return new_venom_seq.addGenesUp(req.body.genes_up);
      } else {
        return Promise.resolve(new_venom_seq);
      }
    })
    .then((new_venom_seq) => {
      // add samples
      if (req.body.samples) {

        return new_venom_seq.addSamples(req.body.samples);
      } else {
        return Promise.resolve(new_venom_seq);
      }
    })
    .then((new_venom_seq) => {
      // add samples
      if (req.body.top_20) {
        return new_venom_seq.addTopConnectivity(req.body.top_20);
      } else {
        return Promise.resolve(new_venom_seq);
      }
    })
    .then((new_venom_seq) => {
      // add samples
      if (req.body.bottom_20) {
        return new_venom_seq.addBottomConnectivity(req.body.bottom_20);
      } else {
        return Promise.resolve(new_venom_seq);
      }
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/* PUT /venom_seqs/:id */
router.put('/:id', (req, res, next) => {
  venom_seq.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(venom_seqs);
  });
});

/* DELETE /venom_seqs/:id */
router.delete('/:id', (req, res, next) => {
  venom_seq.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(venom_seqs);
  });
});

module.exports = router;
