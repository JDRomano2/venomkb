const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.render('index', { title: 'Express' });
    res.send('Hello (API) World!');
});

module.exports = router;
