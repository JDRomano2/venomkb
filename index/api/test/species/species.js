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
const agent = require("../proteins/proteins");

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
        it("Should find, using venomkb_id the added species in the database", (done) => {
            Species.getByVenomKBId(objects.species_test.venomkb_id)
                .then((species) => {
                    expect(species.name).to.equal(objects.species_test.name)
                    expect(species.venomkb_id).to.equal(objects.species_test.venomkb_id)
                    expect(species.annotation_score).to.equal(objects.species_test.annotation_score)
                    expect(species.venom_ref).to.equal(objects.species_test.venom_ref)
                    expect(species.venom.name).to.equal(objects.species_test.venom.name)
                    expect(species.common_name).to.equal(objects.species_test.common_name)
                    expect(species.venom.proteins.length).to.equal(objects.species_test.venom.proteins.length)
                    expect(species.taxonomic_lineage.length).to.equal(objects.species_test.taxonomic_lineage.length)
                    expect(species.out_links.length).to.equal(objects.species_test.out_links.length)
                    done()
                })
                .catch(done)
        })
        it("Should get, using the venomkb_id the added species in the database", (done) => {
            agent
                .get('/species/' + objects.species_test.venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should get, using the name the added species in the database", (done) => {
            agent
                .get('/species/search?name=' + objects.species_test.name)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species with name that already exists in the database", (done) => {
            agent
                .post('/species')
                .send(objects.species_name)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species with venomkb_id that already exists in the database", (done) => {
            agent
                .post('/species')
                .send(objects.species_venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })

        it("Should return 400 when try to add a species without a name", (done) => {
            agent
                .post('/species')
                .send(objects.s_without_name)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species without a venomkb_id", (done) => {
            agent
                .post('/species')
                .send(objects.s_without_venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species without a venom_ref", (done) => {
            agent
                .post('/species')
                .send(objects.s_without_venom_ref)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species without a annotation score", (done) => {
            agent
                .post('/species')
                .send(objects.s_without_annotation_score)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species without a venom name", (done) => {
            agent
                .post('/species')
                .send(objects.p_without_venom_name)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a species without a lastUpdated", (done) => {
            agent
                .post('/species')
                .send(objects.p_without_lastupadated)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
    })
})

module.exports = agent