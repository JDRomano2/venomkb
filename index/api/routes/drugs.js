const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const utils = require('../utils.js');

const vkbid_reg = /D\d{7}/;

router.get('/', (req, res) => {
  Drug.getAll()
    .then(drugs => {
      res.json(drugs);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/index', (req, res, next) => {
  Drug.find({}, { venomkb_id: 1, name: 1 }).exec((err, drugs_ind) => {
    if (err) return next(err);
    res.json(drugs_ind);
  });
});

router.get('/count', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'drug name not specified');
  }
  Drug.getByName(req.query.name)
    .then(drugs => {
      res.json(drugs.length);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'drug id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    Drug.getByVenomKBId(req.params.id)
      .then(drug => {
        res.json(drug);
      })
      .catch();
  } else {
    Drug.getById(req.params.id)
      .then(drug => {
        res.json(drug);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});

module.exports = router;
