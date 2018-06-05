"use strict";

//During the test the env variable is set to test
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");

const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const server = require("../../index.js");
chai.use(chaiHttp);

const Species = require('../../models/Species')
const objects = require("./testObjects");

// Require the agent defined in the initialize
const agent = require("../init");

describe("Species model tests", () => {
    describe("Species add tests", () => {
        it("Should add a species in the database", (done) => {
            agent
                .post('/species')
                .send(objects.species_test)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should find the added species in the database", (done) => {
            Species.getByVenomKBId(objects.species_test.venomkb_id)
                .then((species) => {
                    expect(species.name).to.equal(objects.species_test.name)
                    done()
                })
                .catch(done)
        })
    })
});
