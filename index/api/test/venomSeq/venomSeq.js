"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = "test"

const mongoose = require("mongoose")

const chai = require("chai")
const expect = require("chai").expect
const chaiHttp = require("chai-http")
const server = require("../../index.js")
chai.use(chaiHttp)

const VenomSeq = require("../../models/VenomSeq")
const objects = require("./testObjects")

// Require the agent defined in the initialize
const agent = require("../genomes/genomes")

describe("VenomSeq model tests", () => {
    describe("VenomSeq add tests", () => {
        it("Should add a proteins in the database", done => {
            agent
                .post("/proteins")
                .send(objects.protein_linked)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
                .catch(done)
        })
     
        it("Should add a species in the database", done => {
            agent
                .post("/species")
                .send(objects.species_linked)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
                .catch(done)
        })
        it("Should add a venom_seq in the database", done => {
            agent
                .post("/venom-seq")
                .send(objects.venom_seq)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
                .catch(done)
        })

        it("Should find, using venomkb_id, the added venom_seqs in the database", done => {
            VenomSeq.getByVenomKBId(objects.venom_seq.venomkb_id)
                .then(venom_seq => {
                    expect(venom_seq.name).to.equal(objects.venom_seq.name)
                    expect(venom_seq.venomkb_id).to.equal(objects.venom_seq.venomkb_id)
                    expect(venom_seq.dosage).to.equal(objects.venom_seq.dosage)
                    expect(venom_seq.cell_line).to.equal(objects.venom_seq.cell_line)
                    expect(venom_seq.raw_data).to.equal(objects.venom_seq.raw_data)
                    expect(venom_seq.species_ref).to.be.an("object")
                    expect(venom_seq.genes_up.length).to.equal(objects.venom_seq.genes_up.length)
                    expect(venom_seq.genes_down.length).to.equal(objects.venom_seq.genes_down.length)
                    expect(venom_seq.times_exposed.length).to.equal(objects.venom_seq.times_exposed.length)
                    done()
                })
                .catch(done)
        })
        it("Should get, using the venomkb_id the added venom_seq in the database", done => {
            agent
                .get("/venom-seq/" + objects.venom_seq.venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
                .catch(done)
        })
        it("Should get, using the name the added venom_seq in the database", done => {
            agent
                .get("/venom-seq/search?name=" + objects.venom_seq.name)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done()
                })
                .catch(done)
        })

        // it("Should return 500 when try to add a venom_seq with venomkb_id that already exists in the database", done => {
        // 	agent
        // 		.post("/venom-seqs")
        // 		.send(objects.venom_seq_venomkb_id)
        // 		.then(res => {
        // 			expect(res.statusCode).to.equal(500)
        // 			done()
        // 		})
        // 		.catch(done)
        // })

        // it("Should return 400 when try to add a venom_seq without a name", done => {
        // 	agent
        // 		.post("/venom-seqs")
        // 		.send(objects.g_without_name)
        // 		.then(res => {
        // 			expect(res.statusCode).to.equal(400)
        // 			done()
        // 		})
        // 		.catch(done)
        // })
        // it("Should return 400 when try to add a venom_seq without a venomkb_id", done => {
        // 	agent
        // 		.post("/venom-seqs")
        // 		.send(objects.g_without_venomkb_id)
        // 		.then(res => {
        // 			expect(res.statusCode).to.equal(400)
        // 			done()
        // 		})
        // 		.catch(done)
        // })

        // it("Should return 400 when try to add a venom_seq without a annotation score", done => {
        // 	agent
        // 		.post("/venom-seqs")
        // 		.send(objects.g_without_annotation_score)
        // 		.then(res => {
        // 			expect(res.statusCode).to.equal(400)
        // 			done()
        // 		})
        // 		.catch(done)
        // })
    })
})

module.exports = agent
