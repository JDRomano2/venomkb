"use strict";

//During the test the env variable is set to test
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");

const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chai-http");
const server = require("../../index.js");
chai.use(chaiHttp);

const Protein = require('../../models/Protein')
const objects = require("./testObjects");

// Require the agent defined in the initialize
const agent = require("../init");

describe("Protein model tests", () => {
    describe("Protein add tests", () => {
        it("Should add a protein in the database", (done) => {
            agent
            .post('/proteins')
            .send(objects.protein_test)
            .then(res => {
                expect(res.statusCode).to.equal(200)
                done();
            })
            .catch(done)
        })
        it("Should find the added protein in the database", (done) => {
            Protein.getByVenomKBId(objects.protein_test.venomkb_id)
            .then((protein) => {
                expect(protein.name).to.equal(objects.protein_test.name)
                done()
            })
            .catch(done)
        })
    })
});
