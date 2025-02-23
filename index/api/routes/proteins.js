const express = require('express');
const router = express.Router();
const OutLink = require('../models/Outlink');
const Protein = require('../models/Protein');
const utils = require('../utils.js');

const vkbid_reg = /P\d{7}/;

/**
 * Get a list of all proteins
 * @returns an array of protein object
 */
router.get('/', (req, res) => {
  Protein.getAll()
    .then(proteins => {
      res.json(proteins);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Get a list of  20 proteins
 * @param {Query} limit full name or part of the name of the protein
 * @returns an array of protein object
 */
router.get('/limit', (req, res) => {
  var limit = parseInt(req.query.limit);
  Protein.getByDate(limit)
    .then(proteins => {
      res.json(proteins.splice(limit, limit+20));
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

router.get('/index', (req, res, next) => {
  Protein.find({}, { venomkb_id: 1, name: 1, annotation_score: 1 }).exec((err, proteins_ind) => {
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
router.get('/search', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'protein name not specified');
  }
  Protein.getByName(req.query.name)
    .then(protein => {
      res.json(protein);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find all protein that have a given pattern in their name and return the number
 * @param {Query} name full name or part of the name of the protein
 * @returns the number of protein matched
 */
/* GET /proteins/name */
router.get('/count', (req, res) => {
  if (!req.query.name) {
    return utils.sendStatusMessage(res, 400, 'protein name not specified');
  }
  Protein.getByName(req.query.name)
    .then(proteins => {
      res.json(proteins.length);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find a protein given its id or venomkb_id
 * @param {Params} id object id or venomkb_id of the protein
 * @returns the protein
 */
/* GET /proteins/id */
router.get('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'protein id not specified');
  }
  if (vkbid_reg.test(req.params.id)) {
    Protein.getByVenomKBId(req.params.id)
      .then(protein => {
        res.json(protein);
      })
      .catch();
  } else {
    Protein.getById(req.params.id)
      .then(protein => {
        res.json(protein);
      })
      .catch(err => {
        return utils.sendStatusMessage(res, 500, err.message);
      });
  }
});

/**
     * Create new protein
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
  if (!req.body.venom_ref) {
    return utils.sendStatusMessage(res, 400, 'The venom_ref field is empty');
  }
  if (!req.body.annotation_score) {
    return utils.sendStatusMessage(res, 400, 'The annotation score field is empty');
  }

  // Check if the protein already exists
  return Protein.getByVenomKBId(req.body.venomkb_id)
    .then(protein => {
      if (protein) {
        return Promise.reject({ message: 'venomkb_id already exists' });
      }
      return Promise.resolve();
    })
    .then(() => {
      // Create a new protein
      var new_protein = {
        name: req.body.name,
        lastUpdated: req.body.lastUpdated,
        venomkb_id: req.body.venomkb_id,
        common_name: req.body.common_name,
        venom_ref: req.body.venom_ref,
        annotation_score: req.body.annotation_score,
        pdb_structure_known: req.body.pdb_structure_known,
        description: req.body.description,
        aa_sequence: req.body.aa_sequence,
        pdb_image_url: req.body.pdb_image_url
      };
      return Protein.add(new_protein);
    })
    .then((new_protein) => {
      // add out links
      if (req.body.out_links) {
        return new_protein.addOutLinks(req.body.out_links);
      } else {
        return Promise.resolve(new_protein);
      }
    })
    .then((new_protein) => {
      // add literature predication

      if (req.body.literature_predications) {
        return new_protein.addLiterature(req.body.literature_predications);
      } else {
        return Promise.resolve(new_protein);
      }
    })
    .then((new_protein) => {
      // add literature reference
      if (req.body.literature_references && req.body.literature_references.length > 0) {
        return new_protein.addReference(req.body.literature_references);
      } else {
        return Promise.resolve(new_protein);
      }
    })
    .then((new_protein) => {
      // add go annotation
      if (req.body.go_annotations) {
        return new_protein.addGOAnnotation(req.body.go_annotations);
      } else {
        return Promise.resolve(new_protein);
      }
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/**
     * Create new protein from file
     * @param {Body} name
     * @param {Body} description
    */
router.post('/file', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let json_file = req.files.json_file;

  json_file = JSON.parse(json_file.data.toString('utf-8'));

  if (json_file instanceof Object) {
    json_file = [json_file];
  }

  const promises = [];

  json_file.forEach(protein => {
    // Check if the protein already exists
    promises.push(Protein.getByVenomKBId(protein.venomkb_id)
      .then(protein => {
        if (protein) {
          return Promise.reject({ message: 'venomkb_id already exists' });
        }
        return Promise.resolve();
      })
      .then(() => {
        // Create a new protein
        var new_protein = {
          name: protein.name,
          lastUpdated: protein.lastUpdated,
          venomkb_id: protein.venomkb_id,
          common_name: protein.common_name,
          venom_ref: protein.venom_ref,
          annotation_score: protein.annotation_score,
          pdb_structure_known: protein.pdb_structure_known,
          description: protein.description,
          aa_sequence: protein.aa_sequence,
          pdb_image_url: protein.pdb_image_url
        };
        return Protein.add(new_protein);
      })
      .then((new_protein) => {
        // add out links
        if (protein.out_links) {
          return new_protein.addOutLinks(protein.out_links);
        } else {
          return Promise.resolve(new_protein);
        }
      })
      .then((new_protein) => {
        // add literature predication

        if (protein.literature_predications) {
          return new_protein.addLiterature(protein.literature_predications);
        } else {
          return Promise.resolve(new_protein);
        }
      })
      .then((new_protein) => {
        // add literature reference
        if (protein.literature_references && protein.literature_references.length > 0) {
          return new_protein.addReference(protein.literature_references);
        } else {
          return Promise.resolve(new_protein);
        }
      })
      .then((new_protein) => {
        // add go annotation
        if (protein.go_annotations) {
          return new_protein.addGOAnnotation(protein.go_annotations);
        } else {
          return Promise.resolve(new_protein);
        }
      }));
  });
  return Promise.all(promises)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/**
 * Update a protein
 * @param {Body} name
 * @param {Body} description
*/
router.post('/update/:id', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.body.name) {
    return utils.sendStatusMessage(res, 400, 'The name field is empty');
  }
  if (!req.body.venomkb_id) {
    return utils.sendStatusMessage(res, 400, 'The venomkb_id field is empty');
  }
  if (!req.body.venom_ref) {
    return utils.sendStatusMessage(res, 400, 'The venom_ref field is empty');
  }

  if (!req.body.annotation_score) {
    return utils.sendStatusMessage(res, 400, 'The annotation score field is empty');
  }

  // Check if the protein already exists
  return Protein.getByVenomKBId(req.body.venomkb_id)

    .then(protein => {

      if (!protein) {
        return Promise.reject({ message: 'Protein not found, cannot update a protein that doesn\'t exist' });
      }
    })
    .then(() => {

      // Create a new protein
      var new_protein = {
        name: req.body.name,
        lastUpdated: req.body.lastUpdated,
        venomkb_id: req.body.venomkb_id,
        common_name: req.body.common_name,
        venom_ref: req.body.venom_ref,
        annotation_score: req.body.annotation_score,
        pdb_structure_known: req.body.pdb_structure_known,
        description: req.body.description,
        aa_sequence: req.body.aa_sequence,
        pdb_image_url: req.body.pdb_image_url
      };
      return Protein.update(req.body.venomkb_id, new_protein);
    })
    .then((new_protein) => {

      // add out links
      if (req.body.out_links) {
        return new_protein.updateOutLinks(req.body.out_links);
      } else {
        return new_protein.updateOutLinks([]);
      }
    })
    .then((new_protein) => {
      // add literature predication
      if (req.body.literature_predications) {
        return new_protein.updateLiterature(req.body.literature_predications);
      } else {
        return new_protein.updateLiterature([]);
      }
    })
    .then((new_protein) => {
      // add literature reference
      if (req.body.literature_references) {
        return new_protein.updateReference(req.body.literature_references);
      } else {
        return new_protein.updateReference([]);
      }
    })
    .then((new_protein) => {
      // add GO annotation
      if (req.body.go_annotations) {
        return new_protein.updateGOAnnotation(req.body.go_annotations);
      } else {
        return new_protein.updateGOAnnotation([]);
      }
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      utils.sendErrorMessage(res, err);
    });
});

/**
 * Delete protein
 * @param {Query} id id of the protein to delete
*/
router.delete('/:id', (req, res) => {
  if (!req.params.id) {
    return utils.sendStatusMessage(res, 400, 'Cannot delete without a protein id');
  }
  return Protein.getById(req.params.id)
    .then((protein) => {
      if (protein.out_links) {
        const promises = [];
        for (const out_link of protein.out_links) {
          promises.push(OutLink.delete(out_link._id));
        }
        return Promise.all(promises);
      }
      return Promise.resolve(protein);
    })
    .then((protein) => {
      if (protein.literature_references) {
        const promises = [];
        for (const references of protein.literature_references) {
          promises.push(Reference.delete(references._id));
        }
        return Promise.all(promises);
      }
      return Promise.resolve(protein);
    })
    .then(protein => {
      return Protein.delete(req.params.id);
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(err => {
      utils.sendErrorMessage(res, err);
    });
});

module.exports = router;
