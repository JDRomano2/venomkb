const express = require('express');
const router = express.Router();
const Target = require('../models/Target');
const utils = require('../utils.js');

const vkbid_reg = /W\d{7}/;

router.get('/', (req, res) => {
  Target.getAll()
    .then(targets => {
      res.json(targets);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/count', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'target name not specified');
  }
  Target.getByName(req.query.name)
    .then(targets => {
      res.json(targets.length);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'target id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    Target.getByVenomKBId(req.params.id)
      .then(target => {
        res.json(target);
      })
      .catch();
  } else {
    Target.getById(req.params.id)
      .then(target => {
        res.json(target);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});

module.exports = router;
