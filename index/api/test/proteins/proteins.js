"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = "test"

const mongoose = require("mongoose")

const chai = require("chai")
const expect = require("chai").expect
const chaiHttp = require("chai-http")
const server = require("../../index.js")
chai.use(chaiHttp)

const Protein = require("../../models/Protein")
const OutLink = require("../../models/Outlink")
const objects = require("./testObjects")

// Require the agent defined in the initialize
const agent = require("../init")

describe("Protein model tests", () => {
	describe("Protein add tests", () => {
		it("Should add a protein in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_test)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(err => {
					done(err)
				})
		})
		it("Should find the added protein in the database", done => {
			Protein.getByVenomKBId(objects.protein_test.venomkb_id)
				.then(protein => {
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
		it("Should get the added protein in the database", done => {
			agent
				.get("/proteins/" + objects.protein_test.venomkb_id)
				.then(res => {
					objects.protein_test._id = res.body._id
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should delete the added protein in the database", done => {
			agent
				.delete("/proteins/" + objects.protein_test._id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the out_links and check that they have been removed", done => {
			agent
				.get("/outlinks/")
				.then(res => {
					expect(res.body.length).to.equal(0)
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should add a protein in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_test)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(err => {
					done(err)
				})
		})
		it("Should add a protein in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_simple)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should return 500 when try to add a protein that already exists in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_simple)
				.then(res => {
					expect(res.statusCode).to.equal(500)
					done()
				})
				.catch(done)
		})

		it("Should return 400 when try to add a protein without a name", done => {
			agent
				.post("/proteins")
				.send(objects.p_without_name)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a protein without a venomkb_id", done => {
			agent
				.post("/proteins")
				.send(objects.p_without_venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a protein without a venom_ref", done => {
			agent
				.post("/proteins")
				.send(objects.p_without_venom_ref)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a protein without a annotation score", done => {
			agent
				.post("/proteins")
				.send(objects.p_without_annotation_score)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should find the two added proteins in the database", done => {
			Protein.getAll()
				.then(proteins_list => {
					expect(proteins_list.length).to.equal(2)
					done()
				})
				.catch(done)
		})
	})

	describe("Outlink model test", () => {
		it("Should add protein with same pfam", done => {
			agent
				.post("/proteins")
				.send(objects.protein_pfam)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the added protein and check the number of out_links", done => {
			Protein.getByVenomKBId(objects.protein_pfam.venomkb_id)
				.then(protein => {
					expect(protein.name).to.equal(objects.protein_pfam.name)
					expect(protein.out_links.length).to.equal(objects.protein_pfam.out_links.length)
					done()
				})
				.catch(done)
		})
		it("Should get all the outlinks from the database", done => {
			OutLink.getAll()
				.then(out_links_list => {
					expect(out_links_list.length).to.equal(4)
					done()
				})
				.catch(done)
		})
	})

	describe("Protein update test", () => {
		it("Should update a protein previously added", done => {
			agent
				.post("/proteins/update/" + objects.protein_simple_updated.venomkb_id)
				.send(objects.protein_simple_updated)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the protein and check then updates", done => {
			Protein.getByVenomKBId(objects.protein_simple.venomkb_id)
				.then(protein => {
					expect(protein.name).to.equal(objects.protein_simple_updated.name)
					expect(protein.venomkb_id).to.equal(objects.protein_simple_updated.venomkb_id)
					expect(protein.annotation_score).to.equal(objects.protein_simple_updated.annotation_score)
					expect(protein.venom_ref).to.equal(objects.protein_simple_updated.venom_ref)
					expect(protein.pdb_structure_known).to.equal(objects.protein_simple_updated.pdb_structure_known)
					done()
				})
				.catch(done)
		})
		it("Should add 2 out_links, 2 go, a reference, and 2 predications to a protein that already exist", done => {
			agent
				.post("/proteins/update/" + objects.protein_simple_updated1.venomkb_id)
				.send(objects.protein_simple_updated1)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should check new properties have been correctly added", done => {
			Protein.getByVenomKBId(objects.protein_simple_updated1.venomkb_id)
				.then(protein => {
					expect(protein.name).to.equal(objects.protein_simple_updated1.name)
					expect(protein.venomkb_id).to.equal(objects.protein_simple_updated1.venomkb_id)
					expect(protein.go_annotations.length).to.equal(objects.protein_simple_updated1.go_annotations.length)
					expect(protein.literature_predications.length).to.equal(objects.protein_simple_updated1.literature_predications.length)
					expect(protein.literature_references.length).to.equal(objects.protein_simple_updated1.literature_references.length)
					expect(protein.out_links.length).to.equal(objects.protein_simple_updated1.out_links.length)
					done()
				})
				.catch(done)
		})
		it("Should remove 1 go and 2 predications to a protein that already exists", done => {
			agent
				.post("/proteins/update/" + objects.protein_simple_updated2.venomkb_id)
				.send(objects.protein_simple_updated2)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the protein and check remove properties", done => {
			Protein.getByVenomKBId(objects.protein_simple_updated2.venomkb_id)
				.then(protein => {
					expect(protein.name).to.equal(objects.protein_simple_updated2.name)
					expect(protein.venomkb_id).to.equal(objects.protein_simple_updated2.venomkb_id)
					expect(protein.go_annotations.length).to.equal(objects.protein_simple_updated2.go_annotations.length)
					expect(protein.literature_predications).to.be.empty
					expect(protein.literature_references.length).to.equal(objects.protein_simple_updated2.literature_references.length)
					expect(protein.out_links.length).to.equal(objects.protein_simple_updated2.out_links.length)
					done()
				})
				.catch(done)
		})
		it("Should remove 1 out_link and update a go and a reference to a protein that already exists", done => {
			agent
				.post("/proteins/update/" + objects.protein_simple_updated3.venomkb_id)
				.send(objects.protein_simple_updated3)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the protein and check remove properties", done => {
			Protein.getByVenomKBId(objects.protein_simple_updated3.venomkb_id, "literature_references go_annotations")
				.then(protein => {
					expect(protein.name).to.equal(objects.protein_simple_updated3.name)
					expect(protein.venomkb_id).to.equal(objects.protein_simple_updated3.venomkb_id)
					expect(protein.go_annotations.length).to.equal(objects.protein_simple_updated3.go_annotations.length)
					expect(protein.literature_predications).to.be.empty
					expect(protein.literature_references.length).to.equal(objects.protein_simple_updated3.literature_references.length)
					expect(protein.literature_references[0].title).to.equal(objects.protein_simple_updated3.literature_references[0].title)
					expect(protein.out_links.length).to.equal(objects.protein_simple_updated3.out_links.length)
					expect(protein.go_annotations[0].evidence).to.equal(objects.protein_simple_updated3.go_annotations[0].evidence)
					done()
				})
				.catch(done)
		})
	})
})

module.exports = agent
