const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Venom = require('../models/Venom.js');

/* GET /venoms listing. */
router.get('/', (req, res, next) => {
  //Venom.find({}).sort({ updatedAt: -1 }).exec((err, venoms) => {
  Venom.find({}).exec((err, venoms) => {
    if (err) return next(err);
    res.json(venoms);
  });
});

/* POST /venoms */
router.post('/', (req, res, next) => {
  Venom.create(req.body,  (err, venoms) => {
    if (err) return next(err);
    res.json(venoms);
  });
});

/* GET /venoms/id */
router.get('/:id', (req, res, next) => {
  Venom.findById(req.params.id, (err, venoms) => {
    if (err) return next(err);
    res.json(venoms);
  });
});

/* PUT /venoms/:id */
router.put('/:id', (req, res, next) => {
  Venom.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(venoms);
  });
});

/* DELETE /venoms/:id */
router.delete('/:id', (req, res, next) => {
  Venom.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(venoms);
  });
});

module.exports = router;