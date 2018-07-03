const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Genome = require('../models/Genome.js');
const Species = require('../models/Species.js');
const Protein = require('../models/Protein.js');
const utils = require("../utils.js")



// router.get('/', (req, res, next) => {
//     dbindexitem.find({}).exec((err, dbindexitems) => {
//         if (err) return next(err);
//         res.json(dbindexitems);
//     });
// });

router.get('/', (req, res) => {
    var index = []
    Protein.getIndex()
        .then(proteins => {
            proteins = proteins.map(element => {
                return element.toObject()
            })
            proteins.forEach(element => {
                element.data_type = "Protein"
            });
           index = index.concat(proteins)
            console.log(index);
            
        })
        .then(Species.getIndex)
        .then( species => {
            species = species.map(element => {
                return element.toObject()
            })
            species.forEach(element => {
                element.data_type = "Species"
            });
            index = index.concat(species)
        })
        .then(Genome.getIndex)
        .then( genomes => {
            genomes = genomes.map(element => {
                return element.toObject()
            })
            genomes.forEach(element => {
                element.data_type = "Genome"
            });
            index = index.concat(genomes)
        })
        .then(() => {
            res.send(index)
        })
        .catch((err) => {
            utils.sendErrorMessage(res, err);
        })
});

router.get('/hello', function(req, res, next) {
    res.send('Howdy!');
});

module.exports = router;
