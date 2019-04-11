'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../index.js');
chai.use(chaiHttp);

const Species = require('../models/Species');
const Protein = require('../models/Protein');
const Taxonomic = require('../models/Taxonomic');
const Annotation = require('../models/Annotation');
const Genome = require('../models/Genome');
const Outlink = require('../models/Outlink');
const Reference = require('../models/Reference');
const SystemicEffect = require('../models/SystemicEffect');
const VenomSeq = require('../models/VenomSeq');

const agent = chai.request.agent(server);

describe('Initialize tests', () => {
  it('erase all species', (done) => {
    Species.remove({}, err => {
      if (err) {
        console.error(err);
        done(err);
      }
      done();
    });
  }).timeout(5000);
  it('erase all proteins', (done) => {
    Protein.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  }).timeout(5000);

  it('erase all taxonomic', (done) => {
    Taxonomic.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all annotations', (done) => {
    Annotation.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all genomes', (done) => {
    Genome.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all outlinks', (done) => {
    Outlink.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all references', (done) => {
    Reference.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all systemic effect', (done) => {
    SystemicEffect.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
  it('erase all venomseq', (done) => {
    VenomSeq.remove({}, err => {
      if (err) {
        done(err);
      }
      done();
    });
  });
});

module.exports = agent;
