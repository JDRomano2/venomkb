const utils = require("./utils.js")
const mongoose = require('mongoose');
const Genome = require('./models/Genome')
const Protein = require('./models/Protein')
const Species = require('./models/Species')
const genomes = require('./genomes_06272017')
const species = require('./species_06272017')
const proteins = require('./proteins_06272017')

const request = require('request')

// make a connection
mongoose.connect('mongodb://localhost:27017/venomkb_format');

// get reference to database
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

function createProtein(protein) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://localhost:3001/proteins',
            form: protein
        },
            function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                resolve(body)
            }
        );
    })
}

function createSpecies(species) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://localhost:3001/species',
            form: species
        },
            function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                resolve(body)
            }
        );
    })
}

function createGenome(genome) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://localhost:3001/genomes',
            form: genome
        },
            function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                resolve(body)
            }
        );
    })
}


function populate() {
    proteins.forEach(async function (protein) {
        if (protein.out_links) {
            protein.out_links = utils.formatOutLinksProtein(protein.out_links)
        }
        var hello = await createProtein(protein)
    });

    species.forEach(async function (species_element) {
        if (species_element.out_links) {
            species_element.out_links = utils.formatOutLinksSpecies(species_element.out_links)
        }
        var hello = await createSpecies(species_element)
    });

    genomes.forEach(async function (genome) {
        if (genome.out_links) {
            genome.out_links = utils.formatOutLinksGenome(genome.out_links)
        }
        var hello = await createGenome(genome)
        console.log("Finished");

    });
}

db.once('open', function () {
    console.log("Connection Successful!");
    populate()
});

