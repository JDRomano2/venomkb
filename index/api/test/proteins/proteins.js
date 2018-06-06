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
const OutLink = require('../../models/Outlink')
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
                expect(protein.venomkb_id).to.equal(objects.protein_test.venomkb_id)
                expect(protein.annotation_score).to.equal(objects.protein_test.annotation_score)
                expect(protein.venom_ref).to.equal(objects.protein_test.venom_ref)
                expect(protein.pdb_structure_known).to.equal(objects.protein_test.pdb_structure_known)
                expect(protein.aa_sequence).to.equal(objects.protein_test.aa_sequence)
                expect(protein.description).to.equal(objects.protein_test.description)
                expect(protein.pdb_image_url).to.equal(objects.protein_test.pdb_image_url)
                expect(protein.literature_predications.length).to.equal(objects.protein_test.literature_predications.length)
                expect(protein.literature_references.length).to.equal(objects.protein_test.literature_references.length)
                expect(protein.go_annotations.length).to.equal(objects.protein_test.go_annotations.length)
                expect(protein.out_links.length).to.equal(objects.protein_test.out_links.length)
                done()
            })
            .catch(done)
        })
        it("Should get the added protein in the database", (done) => {
            agent
                .get('/proteins/'+objects.protein_test.venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should add a protein in the database", (done) => {
            agent
                .post('/proteins')
                .send(objects.protein_simple)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should return 500 when try to add a protein that already exists in the database", (done) => {
            agent
                .post('/proteins')
                .send(objects.protein_simple)
                .then(res => {
                    expect(res.statusCode).to.equal(500)
                    done();
                })
                .catch(done)
        })

        it("Should return 400 when try to add a protein without a name", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_name)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a protein without a venomkb_id", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_venomkb_id)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a protein without a venom_ref", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_venom_ref)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a protein without a annotation score", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_annotation_score)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a protein without a pdb_structure_known", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_pdb_structure_know)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should return 400 when try to add a protein without a lastUpdated", (done) => {
            agent
                .post('/proteins')
                .send(objects.p_without_lastUpadated)
                .then(res => {
                    expect(res.statusCode).to.equal(400)
                    done();
                })
                .catch(done)
        })
        it("Should find the two added proteins in the database", (done) => {
            Protein.getAll()
                .then((proteins_list) => {
                    expect(proteins_list.length).to.equal(2)
                    done()
                })
                .catch(done)
        })
    })

    describe("Protein update test", () => {
        it("Should update a protein previously added", (done) => {
            agent
                .post('/proteins/update'+objects.protein_simple_updated.venomkb_id)
                .send(objects.protein_simple_updated)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should get the added protein and check then updates", (done) => {
            Protein.getByVenomKBId(objects.protein_simple.venomkb_id)
                .then((protein) => {
                    expect(protein.name).to.equal(objects.protein_simple_updated.name)
                    expect(protein.venomkb_id).to.equal(objects.protein_simple_updated.venomkb_id)
                    expect(protein.annotation_score).to.equal(objects.protein_simple_updated.annotation_score)
                    expect(protein.venom_ref).to.equal(objects.protein_simple_updated.venom_ref)
                    expect(protein.pdb_structure_known).to.equal(objects.protein_simple_updated.pdb_structure_known)
                    expect(protein.aa_sequence).to.equal(objects.protein_simple_updated.aa_sequence)
                    expect(protein.description).to.equal(objects.protein_simple_updated.description)
                    expect(protein.pdb_image_url).to.equal(objects.protein_simple_updated.pdb_image_url)
                })
                .catch(done)
        })
        it("Should get all the outlinks from the database", (done) => {
            OutLink.getAll()
                .then((out_links_list) => {
                    expect(out_links_list.length).to.equal(4)
                    done()
                })
                .catch(done)
        })
    })

    describe("Outlink model test", ()=>{
        it("Should add protein with same pfam", (done) => {
            agent
                .post('/proteins')
                .send(objects.protein_pfam)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should get the added protein and check the number of out_links", (done) => {
            Protein.getByVenomKBId(objects.protein_pfam.venomkb_id)
                .then((protein) => {
                    expect(protein.name).to.equal(objects.protein_pfam.name)
                    expect(protein.out_links.length).to.equal(objects.protein_pfam.out_links.length)
                    done()
                })
                .catch(done)
        })
        it("Should get all the outlinks from the database", (done) => {
            OutLink.getAll()
            .then((out_links_list) => {
                expect(out_links_list.length).to.equal(4)
                done()
            })
            .catch(done)
        })
    })

    describe("Literature predication model test", () => {
        it("Should add protein with same literature predicaiton and a different", (done) => {
            agent
                .post('/proteins')
                .send(objects.protein_predications)
                .then(res => {
                    expect(res.statusCode).to.equal(200)
                    done();
                })
                .catch(done)
        })
        it("Should get the added protein and check the number of predication", (done) => {
            Protein.getByVenomKBId(objects.protein_predications.venomkb_id)
                .then((protein) => {
                    expect(protein.name).to.equal(objects.protein_predications.name)
                    expect(protein.literature_predications.length).to.equal(objects.protein_predications.literature_predications.length)
                    done()
                })
                .catch(done)
        })

    })
});
