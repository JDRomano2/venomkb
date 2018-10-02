"use strict"

//During the test the env variable is set to test
process.env.NODE_ENV = "test"

const mongoose = require("mongoose")

const chai = require("chai")
const expect = require("chai").expect
const chaiHttp = require("chai-http")
const server = require("../../index.js")
chai.use(chaiHttp)

const SystemicEffect = require("../../models/SystemicEffect")
const objects = require("./testObjects")

// Require the agent defined in the initialize
const agent = require("../proteins/proteins")

describe("SystemicEffect model tests", () => {
	describe("SystemicEffect add tests", () => {
		it("Should add a systemicEffect in the database", done => {
			agent
				.post("/proteins")
				.send(objects.protein_linked)
				.then(res => {
					return agent.post("/proteins").send(objects.protein_linked1)
				})
				.then(res => {
					return agent.post("/systemic-effects").send(objects.systemic_effect)
				})
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should find, using venomkb_id, the added systemicEffects in the database", done => {
			SystemicEffect.getByVenomKBId(objects.systemic_effect.venomkb_id)
				.then(systemicEffect => {

					expect(systemicEffect.name).to.equal(objects.systemic_effect.name)
					expect(systemicEffect.venomkb_id).to.equal(objects.systemic_effect.venomkb_id)
					expect(systemicEffect.protein_annotations.length).to.equal(objects.systemic_effect.protein_annotations.length)
					done()
				})
				.catch(done)
		})
		it("Should find, using the name, the added systemicEffects in the database", done => {
			SystemicEffect.getByName(objects.systemic_effect.name)
				.then(systemicEffect => {

					expect(systemicEffect.name).to.equal(objects.systemic_effect.name)
					expect(systemicEffect.venomkb_id).to.equal(objects.systemic_effect.venomkb_id)
					expect(systemicEffect.protein_annotations.length).to.equal(objects.systemic_effect.protein_annotations.length)
					done()
				})
				.catch(done)
		})
		it("Should get, using the venomkb_id the added systemicEffect in the database", done => {
			agent
				.get("/systemic-effects/" + objects.systemic_effect.venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})
		it("Should get, using the name the added systemicEffect in the database", done => {
			agent
				.get("/systemic-effects/search?name=" + objects.systemic_effect.name)
				.then(res => {
					expect(res.statusCode).to.equal(200)
					done()
				})
				.catch(done)
		})

		it("Should return 500 when try to add a systemicEffect with venomkb_id that already exists in the database", done => {
			agent
				.post("/systemic-effects")
				.send(objects.systemic_effect1)
				.then(res => {
					expect(res.statusCode).to.equal(500)
					done()
				})
				.catch(done)
		})

		it("Should return 400 when try to add a systemicEffect without a name", done => {
			agent
				.post("/systemic-effects")
				.send(objects.systemic_effect_without_name)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
		it("Should return 400 when try to add a systemicEffect without a venomkb_id", done => {
			agent
				.post("/systemic-effects")
				.send(objects.systemic_effect_without_venomkb_id)
				.then(res => {
					expect(res.statusCode).to.equal(400)
					done()
				})
				.catch(done)
		})
	})
})

module.exports = agent
