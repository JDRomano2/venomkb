const utils = require('./utils.js');
const mongoose = require('mongoose');
const Genome = require('./models/Genome');
const Protein = require('./models/Protein');
const Species = require('./models/Species');
const genomes = require('./genomes_06272017');
const species_list = require('./species_06272017');
const proteins = require('./proteins_06272017');
const systemic_effects = require('./systemic');
const venomseqs = require('./venomseq');
const connectivity = require('./connectivity');

const axios = require('axios');

// make a connection
mongoose.connect('mongodb://localhost:27017/venomkb_format');

// get reference to database
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

function createProtein(protein) {
  return axios.post('http://localhost:3001/proteins', protein, { timeout: 100000, maxContentLength: 200000}).then(response => {
    return Promise.resolve();
  }).catch(error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('REQUEST ERROR');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    console.error(error.config);
    return Promise.reject();
  });
}

function createSpecies(species) {
  return axios.post('http://localhost:3001/species', species, { timeout: 100000, maxContentLength: 200000 }).then(response => {
    return Promise.resolve();
  }).catch(error => {
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
    } else if (error.request) {
      console.error('REQUEST ERROR');
    } else {
      console.error('Error', error.message);
    }
    console.error(error.config);
    return Promise.reject();
  });
}

function createGenome(genome) {
  return axios.post('http://localhost:3001/genomes', genome, { timeout: 100000, maxContentLength: 200000 }).then(response => {
    return Promise.resolve();
  }).catch(error => {
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
    } else if (error.request) {
      console.error('REQUEST ERROR');
    } else {
      console.error('Error', error.message);
    }
    console.error(error.config);
    return Promise.reject();
  });
}

function createSystemicEffect(effect) {
  return axios
    .post('http://localhost:3001/systemic-effects', effect, { timeout: 100000, maxContentLength: 200000 })
    .then(response => {
      return Promise.resolve();
    })
    .catch(error => {
      if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
      } else if (error.request) {
        console.error('REQUEST ERROR');
      } else {
        console.error('Error', error.message);
      }
      console.error(error.config);
      return Promise.reject();
    });
}

function createVenomSeq(venomseq) {
  return axios
    .post('http://localhost:3001/venom-seq', venomseq, { timeout: 100000, maxContentLength: 200000 })
    .then(response => {
      return Promise.resolve();
    })
    .catch(error => {
      if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
      } else if (error.request) {
        console.error('REQUEST ERROR');
      } else {
        console.error('Error', error.message);
      }
      console.error(error.config);
      return Promise.reject();
    });
}

async function populate() {
  for (let protein of proteins) {
    if (protein.out_links) {
      protein.out_links = utils.formatOutLinksProtein(protein.out_links);
    }
    if (protein.literature_predications) {
      if (protein.literature_predications.length == 1) {
        protein.literature_predications = protein.literature_predications[0];
      }
    }
    if (!protein.pdb_structure_known) {
      protein.pdb_structure_known = false;
    }
    if (typeof protein.pdb_structure_known != 'boolean') {
      console.error('pdb structure missing', protein.venomkb_id);
    }
    try {
      let hello = await createProtein(protein);
    } catch (error) {
      console.error('ERROR');
    }
  }

  for (let species of species_list) {
    if (species.out_links) {
      species.out_links = utils.formatOutLinksSpecies(species.out_links);
    }
    if (species.literature_predications) {
      species.literature_predications = [];
    }

    try {
      let _ = await createSpecies(species);
    } catch (error) {
      console.error('ERROR');
    }
  }

  for (let genome of genomes) {
    if (genome.out_links) {
      genome.out_links = utils.formatOutLinksGenome(genome.out_links);
    }

    try {
      let _ = await createGenome(genome);
    } catch (error) {
      console.error('ERROR');
    }
  }

  for (let effect of systemic_effects) {
    var effect_formatted = utils.formatSystemicEffect(effect);

    try {
      let _ = await createSystemicEffect(effect_formatted);
    } catch (error) {
      console.error('ERROR');
    }
  }

  for (let venomseq of venomseqs) {
    try {
      let _ = await createVenomSeq(venomseq);
    } catch (error) {
      console.error('ERROR');
    }
  }
}

db.once('open', function () {
  populate();
});

