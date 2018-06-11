"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');

const server = require('../index.js');
chai.use(chaiHttp);

const Species = require("../models/Species")
const Protein = require("../models/Protein")
const Taxonomic = require('../models/Taxonomic')
const Annotation = require('../models/Annotation')
const Genome = require('../models/Genome')
const Outlink = require('../models/Outlink')
const Reference = require('../models/Reference')
const SystemicEffect = require('../models/SystemicEffect')

const agent = chai.request.agent(server);

describe('Initialize tests', () => {
    it("erase all species", (done) => {
        Species.remove({}, err => {
            done(err)
        })
    })
    it("erase all proteins", (done) => {
        Protein.remove({}, err => {
            done(err)
        })
    })

    it("erase all taxonomic", (done) => {
        Taxonomic.remove({}, err => {
            done(err)
        })
    })
    it("erase all annotations", (done) => {
        Annotation.remove({}, err => {
            done(err)
        })
    })
    it("erase all genomes", (done) => {
        Genome.remove({}, err => {
            done(err)
        })
    })
    it("erase all outlinks", (done) => {
        Outlink.remove({}, err => {
            done(err)
        })
    })
    it("erase all references", (done) => {
        Reference.remove({}, err => {
            done(err)
        })
    })
     it("erase all systemic effect", (done) => {
        SystemicEffect.remove({}, err => {
            done(err)
        })
    })
});

module.exports = agent;
