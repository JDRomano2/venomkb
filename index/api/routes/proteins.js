const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Protein = require('../models/Protein.js');

const vkbid_reg = /P\d{7}/;

/* GET /proteins listing. */
router.get('/', (req, res, next) => {
  //protein.find({}).sort({ updatedAt: -1 }).exec((err, proteins) => {
  protein.find({}).exec((err, proteins) => {
    if (err) return next(err);
    res.json(proteins);
  });
});

/* POST /proteins */
router.post('/', (req, res, next) => {
  protein.create(req.body,  (err, proteins) => {
    if (err) return next(err);
    console.log('New protein created:');
    console.log(proteins);
    res.json(proteins);
  });
});

/* GET /proteins/index */
router.get('/index', (req, res, next) => {
  protein.find({}, {venomkb_id: 1, name: 1, venom_ref: 1}).exec((err, proteins_ind) => {
    if (err) return next(err);
    res.json(proteins_ind);
  });
});


// /* GET /proteins/id */
// router.get('/:id', (req, res, next) => {
//   if (vkbid_reg.test(req.params.id)) {
//     console.log("Find by VenomKB id");
//     Protein.find({ 'venomkb_id': req.params.id }, (err, protein) => {
//       if (err) return handleError(err);
//       res.json(protein);
//     });
//   } else {
//     console.log("Find by id");
//     protein.findById(req.params.id, (err, proteins) => {
//       if (err) return next(err);
//       res.json(proteins);
//     });
//   }
// });

/* GET /proteins/id */
router.get('/name', (req, res, next) => {
	if (vkbid_reg.test(req.params.id)) {
		console.log("Find by VenomKB id");
		protein.find({ 'venomkb_id': req.params.id }, (err, protein) => {
			if (err) return next(err);
			res.json(protein);
		});
	} else {
		console.log("Find by id");
		protein.findById(req.params.id, (err, proteins) => {
			if (err) return next(err);
			res.json(proteins);
		});
	}
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
