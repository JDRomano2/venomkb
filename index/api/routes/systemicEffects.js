const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SystemicEffect = require('../models/SystemicEffect.js');
const utils = require("../utils.js")

const vkbid_reg = /E\d{7}/;

/**
 * Get a list of all systemic_effects
 * @returns an array of systemic_effect object
 */
router.get('/', (req, res, next) => {
  SystemicEffect.getAll()
    .then(systemic_effects => {
      res.json(systemic_effects)
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    })
});

/* GET /systemic_effects/index */
router.get('/index', (req, res, next) => {
  systemic_effect.find({}, { venomkb_id: 1, name: 1, venom_ref: 1 }).exec((err, systemic_effects_ind) => {
    if (err) return next(err);
    res.json(systemic_effects_ind);
  });
});

/**
 * Find all systemic_effect that have a given pattern in their name
 * @param {Query} name full name or part of the name of the systemic_effect
 * @returns the systemic_effect if only one result, an array of systemic_effect object in other case
 */
router.get('/search', (req, res, next) => {
  if (!req.query.name) {
    console.log("You must enter a name");
    return utils.sendStatusMessage(res, 400, "systemic_effect name not specified")

  }
  console.log("Find by name");
  SystemicEffect.getByName(req.query.name)
    .then(systemic_effect => {
      res.json(systemic_effect)
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    })
});

/**
 * Find a systemic_effect given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the systemic_effect
 * @returns the systemic_effect
 */
router.get('/:id', (req, res, next) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, "systemic_effect id not specified")
  }
  if (vkbid_reg.test(req.params.id)) {
    console.log("Find by VenomKB id");
    SystemicEffect.getByVenomKBId(req.params.id)
      .then(systemic_effect => {
        res.json(systemic_effect)
      })
      .catch()
  } else {
    console.log("Find by id");
    SystemicEffect.getById(req.params.id)
      .then(systemic_effect => {
        res.json(systemic_effect)
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      })
  }
});

/**
 * Find all systemic effects that have a given pattern in their name
 * @param {Query} name full name or part of the name of the systemic effect
  * @returns the systemic effect if only one result, an array of systemic effects object in other case
 */
router.get('/search', (req, res, next) => {
  if (!req.query.name) {
    console.log("You must enter a name");
    return utils.sendStatusMessage(res, 400, "systemic_effect name not specified")

  }
  console.log("Find by name");
  SystemicEffect.getByName(req.query.name)
		.then(systemic_effect => {
      res.json(systemic_effect)
		})
		.catch(err => {
			return utils.sendStatusMessage(res, 500, err.message)
		})
});

/**
 * Create new systemic_effect
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


  // Check if the systemic_effect already exists
  return SystemicEffect.getByVenomKBId(req.body.venomkb_id)
    .then(systemic_effect => {
      console.log("try to find systemic_effect", systemic_effect);

      if (systemic_effect) {
        return Promise.reject({ message: "venomkb_id already exists" })
      }
    })
    .then(() => {
      // Create a new systemic_effect
      var new_systemic_effect = {
        name: req.body.name,
        venomkb_id: req.body.venomkb_id,
      }
      return SystemicEffect.add(new_systemic_effect)
    })
    .then((new_systemic_effect) => {
      // add protein annotation

      if (req.body.protein_annotations) {
        return new_systemic_effect.addProteinAnnotation(req.body.protein_annotations)
      } else {
        return Promise.resolve(new_systemic_effect);
      }
    })
    .then((new_systemic_effect) => {
      // add out_links
      if (req.body.out_links) {
        return new_systemic_effect.addOutLink(req.body.out_links)
      } else {
        return Promise.resolve(new_systemic_effect);
      }
    })
    .then(() => {
      res.sendStatus(200)
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    })
})



/* PUT /systemic_effects/:id */
router.put('/:id', (req, res, next) => {
  systemic_effect.findByIdAndUpdate(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    res.json(systemic_effects);
  });
});

/* DELETE /systemic_effects/:id */
router.delete('/:id', (req, res, next) => {
  systemic_effect.findByIdAndRemove(req.params.id, req.body, (err, todo) => {
    if (err) return next(err);
    console.log('systemic_effect deleted:');
    console.log(systemic_effects);
    res.json(systemic_effects);
  });
});

module.exports = router;
