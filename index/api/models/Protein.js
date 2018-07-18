const mongoose = require('mongoose');
const OutLink = require('./Outlink');
const Reference = require('./Reference');

// Schema to enforce consistent structure.
const GOAnnotationSchema = new mongoose.Schema({
	term: { type: String, required: true },
	id: { type: String, required: true },
	project: String,
	evidence: String
});

const LiteratureSchema = new mongoose.Schema({
	s_name: { type: String, required: true },
	s_cui: { type: String, required: true },
	s_type: { type: String, required: true },
	predicate: { type: String, required: true },
	o_name: { type: String, required: true },
	o_cui: { type: String, required: true },
	o_type: { type: String, required: true },
	id_pred: { type: String, required: true },
	vkb_protein_ref: { type: String, required: true },
	pmid: { type: Number, required: true },
	toxprot_id: String,
	PID: String,
	SID: String
});

// Schema to enforce consistent structure.
const ProteinSchema = new mongoose.Schema({
	lastUpdated: { type: Date, default: Date.now},
	venomkb_id: { type: String, index: true },
	name: { type: String, required: true },
	venom_ref: { type: String, required: true },
	pdb_structure_known: { type: Boolean, required: true },
	annotation_score: { type: Number, min: 1, max: 5, required: true },
	description: String,
	aa_sequence: String,
	pdb_image_url: String,
	literature_predications: [LiteratureSchema],
	literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
	go_annotations: [GOAnnotationSchema],
	out_links: [{ type: mongoose.Schema.ObjectId, ref: 'OutLink' }]
});

/**
 * Add outlinks to a protein
 * @param {Array} out_links an array of out_links objects
 */
ProteinSchema.methods.addOutLinks = function (out_links) {
	if (!(out_links.constructor === Array)) {
		return Promise.reject({ message: "Literatures not a list" })
	}

	const protein = this;
	if (typeof out_links[0] == "object") {
		const promises = [];
		out_links.forEach(element => {
			promises.push(new Promise((resolve, reject) => {
				if (element.shared) {
					return OutLink.findOne(element).exec().then((el) => {
						if (el) {
							return Promise.resolve(el)
						}
						return OutLink.add(element)
					}).then((out_link) => {
						protein.out_links.push(out_link._id);
						resolve();
					}).catch(reject)
				}
				if (!element.primary_id)
					return reject({ message: "NOT SHARED " + element.primary_id })
				return OutLink.add(element)

					.then((out_link) => {
						protein.out_links.push(out_link._id);
						resolve();
					}).catch(reject)

			}))
		})
		return Promise.all(promises).then(() => {
			return protein.save()
		});
	} else {
		return Promise.reject({ message: "Out Link list must contain object" })
	}
}

/**
 * Update outlinks to a protein
 * @param {Array} out_links an array of out_links objects
 */

ProteinSchema.methods.updateOutLinks = function (out_links) {
	const protein = this;
	if ((out_links instanceof Array)) {
		const promises = [];
		out_links.forEach(element=> {
			promises.push(new Promise((resolve, reject) => {
				let query = {
					primary_id: element.primary_id,
					resource: element.resource,
					shared: element.shared
				}
				return OutLink.findOne(query).exec().then(found=>{
					if (!found) {
						return OutLink.add(query).then((out_link) => {
							protein.out_links.push(out_link._id);
							resolve();
						}).catch(reject)
					}
					else {
						console.log(found);
						let out_link_index = protein.out_links.findIndex((found) => { return found == found._id })
						if (out_link_index == -1) {
							protein.out_links.push(found._id);
							resolve()
						}
						resolve()
					}
				})
			}))
		})
		let indexes = []
		protein.out_links.forEach(element_id =>{
			promises.push(new Promise((resolve, reject) => {
				return OutLink.findOne(element_id).populate('proteins').exec().then((out_link) => {
					console.log(element_id);
					
					let index = out_links.findIndex((element) => {
						return element.resource == out_link.resource &&
						element.primary_id == out_link.primary_id
					})
										
					if (index == -1 ) {
						let out_link_index = protein.out_links.findIndex((element) => { return element == element_id})
						indexes.push(out_link_index)
						return OutLink.delete(element_id).then(resolve).catch(reject)
					}
					resolve()
				}).catch(reject)
			}))
		})
		return Promise.all(promises).then(() => {
			indexes = indexes.sort().reverse()
			indexes.forEach(index => {
				protein.out_links.splice(index, 1)
			})
			return protein.save()
		});
	} else {
		return Promise.reject({ message: "Out links field should be an array" })
	}

}


/**
 * Add literatures to a protein
 * @param {Array} literatures an array of literature_predications objects
 */
ProteinSchema.methods.addLiterature = function (literatures) {
	if (!(literatures.constructor === Array)) {
		return Promise.reject({ message: "Literatures not a list" })
	}

	const protein = this;

	if (typeof literatures[0] == "object") {
		literatures.forEach(element => {
			protein.literature_predications.push(element)
		})
		return protein.save()
	} else {
		return Promise.reject({ message: "Literatures list must contain object" })
	}
}

ProteinSchema.methods.updateLiterature = function(literatures) {
	if (!(literatures.constructor === Array)) {
		return Promise.reject({ message: "Literatures not a list" })
	}

	const protein = this;

	protein.literature_predications = []
	if (literatures.length === 0)
		return protein.save()
	return protein.save()
	.then(() => {
		return protein.addLiterature(literatures)
	})
}

/**
 * Add literature references to a protein
 * @param {Array} references an array of literature_reference objects
 */
ProteinSchema.methods.addReference = function (references) {
	if (references.constructor != Array) {
		return Promise.reject({ message: "References not a list" })
	}

	const protein = this;

	if (typeof references[0] == "object") {
		const promises = [];

		references.forEach(element => {
			promises.push(new Promise((resolve, reject) => {
				return Reference.add(element)
					.then((reference) => {
						protein.literature_references.push(reference._id);
						resolve();
					}).catch(reject)
			})
			)
		})
		return Promise.all(promises).then(() => {
			return protein.save()
		});
	} else {
		return Promise.reject({ message: "References list must contain object" })
	}
}

/**
 * Update outlinks to a protein
 * @param {Array} references an array of references objects
 */

ProteinSchema.methods.updateReference = function (references) {
	const protein = this;
	if ((references instanceof Array)) {
		const promises = [];
		references.forEach(element => {
			promises.push(new Promise((resolve, reject) => {
				let query = {
					pmid: element.pmid,
					title: element.title,
					first_author: element.first_author,
					authors: element.authors,
					journal_name: element.journal_name,
					doi: element.doi,
					citation: element.citation,
					date: element.date
				}
				return Reference.findOne(query).exec().then(found => {
					if (!found) {
						return Reference.add(query).then((reference) => {
							protein.literature_references.push(reference._id);
							resolve();
						}).catch(reject)
					}
					else {
						console.log(found);
						let reference_index = protein.literature_references.findIndex((found) => { return found == found._id })
						if (reference_index == -1) {
							protein.literature_references.push(found._id);
							resolve()
						}
						resolve()
					}
				})
			}))
		})
		let indexes = []
		protein.literature_references.forEach(element_id => {
			promises.push(new Promise((resolve, reject) => {
				return Reference.findOne(element_id).populate('proteins').exec().then((reference) => {
					let index = references.findIndex((element) => {
						return element.title == reference.title &&
							element.first_author == reference.first_author &&
							element.authors == reference.authors &&
							element.journal_name == reference.journal_name &&
							element.pmid == reference.pmid &&
							element.citation == reference.citation
					})

					if (index == -1) {
						let reference_index = protein.literature_references.findIndex((element) => { return element == element_id })
						indexes.push(reference_index)
						return Reference.delete(element_id).then(resolve).catch(reject)
					}
					resolve()
				}).catch(reject)
			}))
		})
		return Promise.all(promises).then(() => {
			indexes = indexes.sort().reverse()
			indexes.forEach(index => {
				protein.literature_references.splice(index, 1)
			})
			return protein.save()
		});
	} else {
		return Promise.reject({ message: "Reference field should be an array" })
	}

}
/**
 * Add literature gene annotation to a protein
 * @param {Array} go_annotation an array of go_annotation objects
 */
ProteinSchema.methods.addGOAnnotation = function (annotations) {
	if (!(annotations.constructor === Array)) {
		return Promise.reject({ message: "Annotation not a list" })
	}

	const protein = this;

	if (typeof annotations[0] == "object") {
		annotations.forEach(element => {
				protein.go_annotations.push(element);
		})
		return protein.save()
	} else {
		return Promise.reject({ message: "Annotations list must contain object" })
	}
}

ProteinSchema.methods.updateGOAnnotation = function (annotations) {
	if (!(annotations.constructor === Array)) {
		return Promise.reject({ message: "Annotation not a list" })
	}

	const protein = this;

	protein.go_annotations = []
	if (annotations.length === 0)
		return protein.save()
	return protein.save()
		.then(() => {
			return protein.addGOAnnotation(annotations)
		})
}

const Protein = mongoose.model('Protein', ProteinSchema);

/**
 * returns all the proteins
 */
Protein.getAll = () => {
	return new Promise((resolve, reject) => {
		Protein.find({})
			.exec((err, proteins) => {
				if (err) reject(err)
				resolve(proteins)
			})
	})
}

/**
 * Get an protein given its venomkb_id
 * @param {ObjectId} id  id of the protein to get
 */
Protein.getByVenomKBId = (venomkb_id) => {
	return new Promise((resolve, reject) => {
		Protein.findOne({ venomkb_id: venomkb_id })
			.populate('out_links literature_references')
			.exec((err, protein) => {
				if (err) {
					reject(err);
				}
				resolve(protein);
			});
	});
};


/**
 * Get an protein given its id
 * @param {ObjectId} id  id of the protein to get
 */
Protein.getById = (id) => {
	return new Promise((resolve, reject) => {
		Protein.findOne({ _id: id })
			.populate('out_links literature_references')
			.exec((err, protein) => {
				if (err) {
					reject(err);
				}
				resolve(protein);
			});
	});
};

/**
 * Get an protein given its name
 * @param {String} name  name of the protein to get
 * @param {String} path path to populate (leave blank if none)
 */
Protein.getByName = (name, path) => {
	return new Promise((resolve, reject) => {
		Protein.find({ $text: { $search: name } })
			.populate(path || '')
			.exec((err, proteins) => {
				if (err) {
					reject(err);
				}
				resolve(proteins);
			});
	});
};

/**
 * Get an array of protein sorted by date
 * @param {Number} limit  length of the result
 */
Protein.getByDate = (limit) => {
	return new Promise((resolve, reject) => {
		Protein.find({},{venomkb_id: 1, name: 1, venom_ref: 1, annotation_score:1 })
			.sort({ date: -1 })
			.limit(limit+20)
			.exec((err, proteins) => {
				if (err) {
					reject(err)
				}
				resolve(proteins)
			})
	});
};

/**
 * Get an array of protein index
 */
Protein.getIndex = () => {
	return new Promise((resolve, reject) => {
		Protein.find({}, { venomkb_id: 1, name: 1, annotation_score: 1 })
			.exec((err, proteins) => {
				if (err) {
					reject(err)
				}
				resolve(proteins)
			})
	});
};
//========================================
// ADD
//========================================

/**
 * Add a protein to the database
 * @param {Object} new_protein to be added
 */
Protein.add = new_protein => {

	return new Promise((resolve, reject) => {
		Protein.create(new_protein, (err, created_protein) => {
			if (err) reject(err)

			resolve(created_protein)
		})
	})
}



//========================================
// UPDATE
//========================================
/**
 * Update a protein to the database
 * @param {Object} updated_protein
 */
Protein.update = (venomkb_id, updated_protein) => {
	return Protein.findOneAndUpdate({ venomkb_id: venomkb_id }, updated_protein).exec()
}

//========================================
// DELETE
//========================================

/**
 * Delete a protein
 * @param {ObjectId} id reference id of the protein which needs to be removed from the database
 */
Protein.delete = id => {
	return new Promise((resolve, reject) => {
		Protein.findById(id).then(protein => {
			return protein.remove(err => {
				if (err) {
					reject(err)
				}
				resolve()
			})
		})
	})
}


module.exports = Protein;


