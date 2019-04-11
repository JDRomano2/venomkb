const express = require('express');
const router = express.Router();
const _ = require('lodash');

const { NeoAdapter, Query } = require('../semantic/Query');
const {
  USER,
  PASSWORD,
  URI
} = require('../semantic/semantic.cfg');

const neo = new NeoAdapter(USER, PASSWORD, URI);

router.get('/test', (req, res) => {
  res.send('Hello (semantic) world!');
});

/**
 * Send a json in the body and return the answer
 * @param {Body} name
 * @param {Body} description
*/
router.post('/', function (req, res) {

  const json = req.body;

  const query = new Query(json, neo);
  query.retrieveSubgraph().then(() => {
    res.json(query['result']);
  }).catch(err => {
    res.status(500).send(err);
  });
});

/**
 * The json is entered as a string in the url and return the answer
 * @param {Body} name
 * @param {Body} description
*/
router.post('/url', function (req, res) {
  // Check if all the necessary fields are there

  if (!req.query.json)
    return res.status(400).send('No json were sent');
  const json = JSON.parse(req.query.json);

  const query = new Query(json, neo);
  query.retrieveSubgraph().then(() => {
    res.json(query['result']);
  }).catch(err => {
    res.status(500).send(err);
  });
});



/**
 * Send a json file and return the answer
 * @param {Body} name
 * @param {Body} description
*/
router.post('/file',async function (req, res) {
  // Check if all the necessary fields are there

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let json_file = req.files.json_file;
  json_file = JSON.parse(json_file.data.toString('utf-8'));

  const query = new Query(json_file, neo);
  await query.retrieveSubgraph();
  res.json(query['result']);
});


module.exports = router;
