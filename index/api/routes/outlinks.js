const express = require('express');
const router = express.Router();
const OutLinks = require('../models/Outlink.js');
const utils = require('../utils.js');
const _ = require('lodash');

/**
 * Get a list of all out-links
 * @returns an array of out links object
 */
router.get('/', (req, res) => {
  OutLinks.getAll()
    .then(out_links => {
      res.json(out_links);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Get a list of all resource name of outlinks shared
 * @returns an array of out links object
 */
router.get('/shared', (req, res) => {
  OutLinks.getByShared()
    .then(out_links => {

      let resources = _.uniq(out_links.map(element => { return element.resource;}));
      resources = resources.map(element => { return {resource: element};});
      res.json(resources);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find all out links that have a given pattern in their name resource
 * @param {Query} name name of the resource
 * @returns an array of out_links
 */
router.get('/resource', (req, res) => {
  if (!req.query.resource) {
    console.error('No resource name provided');
    return utils.sendStatusMessage(res, 400, 'No resource specify for the out links');

  }
  OutLinks.getByResource(req.query.resource)
    .then(out_links => {
      res.json(out_links);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

/**
 * Find all out links that have a given pattern in their primary_id
 * @param {Query} value the value or primary_id that you are looking for
 * @returns an array of out_links
 */
router.get('/value', (req, res) => {
  if (!req.query.value) {
    console.error('No value provided');
    return utils.sendStatusMessage(res, 400, 'No value specified for the out links');

  }
  OutLinks.getByPrimaryId(req.query.value)
    .then(out_links => {
      res.json(out_links);
    })
    .catch(err => {
      return utils.sendStatusMessage(res, 500, err.message);
    });
});

module.exports = router;
