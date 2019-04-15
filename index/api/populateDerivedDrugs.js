//const utils = require('./utils.js');
const mongoose = require('mongoose');
const axios = require('axios');
const Drug = require('./models/Drug');
const Protein = require('./models/Protein');

const drugs_json = require('./drugs');

mongoose.connect('mongodb://localhost:27017/venomkb_format');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

function createDrug(drug) {
  return axios.post('http://localhost:3001/drugs', drug, { timeout: 100000, maxContentLength: 200000}).then(response => {
    return Drug.resolve();
  }).catch(error => {
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
    } else if (error.request) {
      console.error('REQUEST ERROR');
    } else {
      console.error('Error:', error.message);
    }
    console.error(error.config);
    return Promise.reject();
  });
}


const handleError = function (error) {
  console.error('Error:', error);
};

// Find ref corresponding to protein
async function linkProteinsToDrugs() {
  //const all_drugs = await Drug.find({});
  // for (var drg in all_drugs) {
  //   const prot = await Protein.getByVenomKBId(drg.derived_from_protein);
  //   console.log(prot.venomkb_id);
  // }
  const prot = await Protein.getByVenomKBId('P9692848');
  console.log(prot);
  // console.log(drg.name);
  // console.log(prot.name);
}

linkProteinsToDrugs();