"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = "test"

const mongoose = require("mongoose")

const chai = require("chai")
const expect = require("chai").expect
const chaiHttp = require("chai-http")
const server = require("../../index.js")
chai.use(chaiHttp)

const Genome = require("../../models/Genome")
const objects = require("./testObjects")

// Require the agent defined in the initialize
const agent = require("../species/species")

describe("Genome model tests", () => {
	describe("Genome add tests", () => {
		it("Should add a genome in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_linked)
				.then(res => {
					return agent.post("/species").send(objects.species_linked)
				})
				.then(res => {
					return agent.post("/genomes").send(objects.genome_test)
				})
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should find, using venomkb_id, the added genomes in the database", done => {
			Genome.getByVenomKBId(objects.genome_test.venomkb_id)
				.then(genome => {
					expect(genome.name).to.equal(objects.genome_test.name)
					expect(genome.venomkb_id).to.equal(objects.genome_test.venomkb_id)
					expect(genome.annotation_score).to.equal(objects.genome_test.annotation_score)
					expect(genome.species_ref).to.equal(objects.genome_test.species_ref)
					expect(genome.literature_reference).to.be.an("object")
					expect(genome.out_links.length).to.equal(objects.genome_test.out_links.length)
					done()
				})
				.catch(done)
		})
		it("Should get, using the venomkb_id the added genome in the database", done => {
			agent
				.get("/genomes/" + objects.genome_test.venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get, using the name the added genome in the database", done => {
			agent
				.get("/genomes/search?name=" + objects.genome_test.name)
				.then(res => {
					objects.genome_test._id = res.body._id
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should delete the added genome in the database", done => {
			agent
				.delete("/genomes/" + objects.genome_test._id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})

		// it("Should return 500 when try to add a genome with venomkb_id that already exists in the database", done => {
		// 	agent
		// 		.post("/genomes")
		// 		.send(objects.genome_venomkb_id)
		// 		.then(res => {
		// 			expect(res.statusCode).to.equal(500)
		// 			done()
		// 		})
		// 		.catch(done)
		// })

		// it("Should return 400 when try to add a genome without a name", done => {
		// 	agent
		// 		.post("/genomes")
		// 		.send(objects.g_without_name)
		// 		.then(res => {
		// 			expect(res.statusCode).to.equal(400)
		// 			done()
		// 		})
		// 		.catch(done)
		// })
		// it("Should return 400 when try to add a genome without a venomkb_id", done => {
		// 	agent
		// 		.post("/genomes")
		// 		.send(objects.g_without_venomkb_id)
		// 		.then(res => {
		// 			expect(res.statusCode).to.equal(400)
		// 			done()
		// 		})
		// 		.catch(done)
		// })

		// it("Should return 400 when try to add a genome without a annotation score", done => {
		// 	agent
		// 		.post("/genomes")
		// 		.send(objects.g_without_annotation_score)
		// 		.then(res => {
		// 			expect(res.statusCode).to.equal(400)
		// 			done()
		// 		})
		// 		.catch(done)
		// })
    })

    describe("HELLLLOOOO", () => {
		it("Should print hello", (done) => {
			done()
		})
    })
})

module.exports = agent
