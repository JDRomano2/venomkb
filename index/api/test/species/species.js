"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = "test"

const mongoose = require("mongoose")

const chai = require("chai")
const expect = require("chai").expect
const chaiHttp = require("chai-http")
const server = require("../../index.js")
chai.use(chaiHttp)

const Species = require("../../models/Species")
const objects = require("./testObjects")

// Require the agent defined in the initialize
const agent = require("../systemicEffect/systemicEffect")

describe("Species model tests", () => {
	describe("Species add tests", () => {
		it("Should add a species in the database", done => {
			agent
				.post("/species")
				.send(objects.species_test)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should find, using venomkb_id the added species in the database", done => {
			Species.getByVenomKBId(objects.species_test.venomkb_id)
				.then(species => {
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
		it("Should get, using the venomkb_id the added species in the database", done => {
			agent
				.get("/species/" + objects.species_test.venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get, using the name the added species in the database", done => {
			agent
				.get("/species/search?name=" + objects.species_test.name)
				.then(res => {
					objects.species_test._id = res.body._id
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should delete the added species in the database", done => {
			agent
				.delete("/species/" + objects.species_test._id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should add the species in the database", done => {
			agent
				.post("/species")
				.send(objects.species_test)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(err => {
					done(err)
				})
		})
		it("Should return 400 when try to add a species with name that already exists in the database", done => {
			agent
				.post("/species")
				.send(objects.species_name)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a species with venomkb_id that already exists in the database", done => {
			agent
				.post("/species")
				.send(objects.species_venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})

		it("Should return 400 when try to add a species without a name", done => {
			agent
				.post("/species")
				.send(objects.s_without_name)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a species without a venomkb_id", done => {
			agent
				.post("/species")
				.send(objects.s_without_venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a species without a venom_ref", done => {
			agent
				.post("/species")
				.send(objects.s_without_venom_ref)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a species without a annotation score", done => {
			agent
				.post("/species")
				.send(objects.s_without_annotation_score)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a species without a venom name", done => {
			agent
				.post("/species")
				.send(objects.p_without_venom_name)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
	})

	describe("Species update test", () => {
		it("Should add a simple species", done => {
			agent
				.post("/proteins")
				.send(objects.protein_linked)
				.then(res => {
					return agent.post("/species").send(objects.s_simple)
				})
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get the added species", done => {
			Species.getByVenomKBId(objects.s_simple.venomkb_id)
				.then(species => {
					expect(species.name).to.equal(objects.s_simple.name)
					expect(species.venomkb_id).to.equal(objects.s_simple.venomkb_id)
					expect(species.annotation_score).to.equal(objects.s_simple.annotation_score)
					expect(species.venom_ref).to.equal(objects.s_simple.venom_ref)
					expect(species.venom.name).to.equal(objects.s_simple.venom.name)
					done()
				})
				.catch(done)
		})
		it("Should add 1 out_links to a species that already exists", done => {
			agent
				.post("/species/update/" + objects.s_simple_updated.venomkb_id)
				.send(objects.s_simple_updated)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should check new properties have been correctly added", done => {
			Species.getByVenomKBId(objects.s_simple_updated.venomkb_id)
				.then(species => {
					expect(species.name).to.equal(objects.s_simple_updated.name)
					expect(species.venomkb_id).to.equal(objects.s_simple_updated.venomkb_id)
					expect(species.annotation_score).to.equal(objects.s_simple_updated.annotation_score)
					expect(species.venom_ref).to.equal(objects.s_simple_updated.venom_ref)
					expect(species.venom.name).to.equal(objects.s_simple_updated.venom.name)
					expect(species.out_links.length).to.equal(objects.s_simple_updated.out_links.length)
					done()
				})
				.catch(done)
		})
		it("Should add taxonomic lineage to a species that already exists", done => {
			agent
				.post("/species/update/" + objects.s_simple_updated1.venomkb_id)
				.send(objects.s_simple_updated1)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should check new properties have been correctly added", done => {
			Species.getByVenomKBId(objects.s_simple_updated1.venomkb_id)
				.then(species => {
					expect(species.name).to.equal(objects.s_simple_updated1.name)
					expect(species.venomkb_id).to.equal(objects.s_simple_updated1.venomkb_id)
					expect(species.annotation_score).to.equal(objects.s_simple_updated1.annotation_score)
					expect(species.venom_ref).to.equal(objects.s_simple_updated1.venom_ref)
					expect(species.venom.name).to.equal(objects.s_simple_updated1.venom.name)
					expect(species.out_links.length).to.equal(objects.s_simple_updated1.out_links.length)
					expect(species.taxonomic_lineage.length).to.equal(objects.s_simple_updated1.taxonomic_lineage.length)
					done()
				})
				.catch(done)
		})
	})
})

module.exports = agent
