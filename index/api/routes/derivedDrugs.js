const express = require('express');
const router = express.Router();
const DerivedDrug = require('../models/DerivedDrug');
const utils = require('../utils.js');

const vkbid_reg = /D\d{7}/;

router.get('/', (req, res) => {
  DerivedDrug.getAll()
    .then(derivedDrugs => {
      res.json(derivedDrugs);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/index', (req, res, next) => {
  DerivedDrug.find({}, { venomkb_id: 1, name: 1 }).exec((err, derived_drugs_ind) => {
    if (err) return next(err);
    res.json(derived_drugs_ind);
  });
});

router.get('/count', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'derived drug name not specified');
  }
  DerivedDrug.getByName(req.query.name)
    .then(derivedDrugs => {
      res.json(derivedDrugs.length);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'derived drug id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    DerivedDrug.getByVenomKBId(req.params.id)
      .then(derivedDrug => {
        res.json(derivedDrug);
      })
      .catch();
  } else {
    DerivedDrug.getById(req.params.id)
      .then(derivedDrug => {
        res.json(derivedDrug);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});