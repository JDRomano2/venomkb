const utils = require("./utils.js")
const mongoose = require('mongoose');
const Genome = require('./models/Genome')
const Protein = require('./models/Protein')
const Species = require('./models/Species')
const genomes = require('./genomes_06272017')
const species_list = require('./species_06272017')
const proteins = require('./proteins_06272017')

const axios = require('axios')

// make a connection
mongoose.connect('mongodb://localhost:27017/venomkb_format');

// get reference to database
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

function createProtein(protein) {
    return axios.post('http://localhost:3001/proteins', protein, { timeout: 100000, maxContentLength: 200000}).then(response => {
        return Promise.resolve()
    }).catch(error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            // console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("REQUEST ERROR");
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
        console.log(error.config);
        console.log('\n\n\n\n\n');
        return Promise.reject()
    })
}

function createSpecies(species) {
    return axios.post('http://localhost:3001/species', species, { timeout: 100000, maxContentLength: 200000 }).then(response => {
        return Promise.resolve()
    }).catch(error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            // console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("REQUEST ERROR");
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
        console.log(error.config);
        console.log('\n\n\n\n\n');
        return Promise.reject()
    })
}

function createGenome(genome) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://localhost:3001/genomes',
            form: genome,
            json: true
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


async function populate() {
    let counter = 0;
    for (let protein of proteins) {
        if (protein.out_links) {
            protein.out_links = utils.formatOutLinksProtein(protein.out_links)
        }
        if (protein.literature_predications) {
            if (protein.literature_predications.length == 1) {
                protein.literature_predications = protein.literature_predications[0]
            }
        }
        if (typeof protein.pdb_structure_known != "boolean") {
            console.log("pdb structure manquante", protein.venomkb_id);
        }
        try {
            let hello = await createProtein(protein)
        } catch (error) {
            console.log("ERROR");
        }
    }

    for (let species of species_list) {
        if (species.out_links) {
            species.out_links = utils.formatOutLinksSpecies(species.out_links)
        }
        if (species.literature_predications) {
            species.literature_predications = []
        }

        try {
            let hello = await createSpecies(species)
        } catch (error) {
            console.log("ERROR");
        }
    }


console.log("BANDE D'ENCULES !!!");


    // species.forEach(async function (species_element) {
    //     if (species_element.out_links) {
    //         species_element.out_links = utils.formatOutLinksSpecies(species_element.out_links)
    //     }
    //     var hello = await createSpecies(species_element)
    // });

    // genomes.forEach(async function (genome) {
    //     if (genome.out_links) {
    //         genome.out_links = utils.formatOutLinksGenome(genome.out_links)
    //     }
    //     var hello = await createGenome(genome)
    //     console.log("Finished");

    // });
}

db.once('open', function () {
    console.log("Connection Successful!");
    populate()
});

