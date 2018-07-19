const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OutLinks = require('../models/Outlink.js');
const utils = require("../utils.js")
const _ = require('lodash')

const { NeoAdapter, Query } = require('../semantic/Query');
const {
    USER,
    PASSWORD,
    URI
} = require('../semantic/semantic.cfg');

const neo = new NeoAdapter(USER, PASSWORD, URI);

/**
 * Send a json and return the answer
 * @param {Body} name
 * @param {Body} description
*/
router.post("/file",async function (req, res) {
    // Check if all the necessary fields are there

    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let json_file = req.files.json_file;
    json_file = JSON.parse(json_file.data.toString("utf-8"))

    console.log(json_file);
    const query = new Query(json_file, neo);
    await query.retrieveSubgraph();
    res.json(query["result"]);




    
 
})



module.exports = router;
