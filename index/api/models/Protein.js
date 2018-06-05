const mongoose = require('mongoose');
const OutLink = require('./Outlink');
const Literature = require('./Literature');
const Reference = require('./Reference');
const Annotation = require('./Annotation');

// Schema to enforce consistent structure.
const ProteinSchema = new mongoose.Schema({
    venomkb_id: { type: String, index:true },
    lastUpdated: {type: Date, required:true},
    name: {type: String, required: true},
    venom_ref: {type: String, required: true},
    pdb_structure_known: {type:Boolean, required: true},
    annotation_score: { type: Number, min: 1, max: 5, required: true },
    description: String,
    aa_sequence: String,
    pdb_image_url: String,
    literature_predications: [{ type: mongoose.Schema.ObjectId, ref: 'Literature' }],
    literature_references: [{ type: mongoose.Schema.ObjectId, ref: 'Reference' }],
    go_annotations: [{ type: mongoose.Schema.ObjectId, ref: 'Annotation' }],
    out_links: [{ type: mongoose.Schema.ObjectId, ref: 'Outlink' }]
});

/**
 * Add outlinks to a protein
 * @param {Array} out_links an array of out_links objects
 */
ProteinSchema.methods.addOutLinks = function (out_links) {
  const protein = this;
  if ((out_links.constructor === Array)) {
    const promises = [];
    out_links.forEach(element => {
      promises.push(new Promise((resolve, reject) => {
        return OutLink.add(element).then((out_link) => {
          protein.out_links.push(out_link._id);
          resolve();
        }).catch(reject)
      }))
    })
    return Promise.all(promises).then(() => {
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
    const promises = [];
    literatures.forEach(element => {
      promises.push(new Promise((resolve, reject) => {
        return Literature.add(element)
          .then((literature) => {
            protein.literature_predications.push(literature._id);
            resolve();
          }).catch(reject)
      })
      )
    })
    return Promise.all(promises).then(() => {
      return protein.save()
    });
  } else {
    return Promise.reject({ message: "Literatures list must contain object" })
  }
}

/**
 * Add literature references to a protein
 * @param {Array} references an array of literature_reference objects
 */
ProteinSchema.methods.addReference = function (references) {
  if (!(references.constructor === Array)) {
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
 * Add literature gene annotation to a protein
 * @param {Array} go_annotation an array of go_annotation objects
 */
ProteinSchema.methods.addAnnotation = function (annotations) {
  if (!(annotations.constructor === Array)) {
    return Promise.reject({ message: "Annotation not a list" })
  }

  const protein = this;

  if (typeof annotations[0] == "object") {
    const promises = [];
    annotations.forEach(element => {
      promises.push(new Promise((resolve, reject) => {
        return Annotation.add(element)
          .then((annotation) => {
            protein.go_annotations.push(annotation._id);
            resolve();
          }).catch(reject)
      })
      )
    })
    return Promise.all(promises).then(() => {
      return protein.save()
    });
  } else {
    return Promise.reject({ message: "Annotations list must contain object" })
  }
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
 * @param {String} path path to populate (leave blank if none)
 */
Protein.getByVenomKBId = (venomkb_id, path) => {
  return new Promise((resolve, reject) => {
    Protein.findOne({ venomkb_id: venomkb_id })
      .populate(path || '')
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
 * @param {String} path path to populate (leave blank if none)
 */
Protein.getById = (id, path) => {
  return new Promise((resolve, reject) => {
    Protein.findOne({ _id: id })
      .populate(path || '')
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
    Protein.find({ $text: { $search: name } } )
      .populate(path || '')
      .exec((err, proteins) => {
        if (err) {
          reject(err);
        }
        resolve(proteins);
      });
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


module.exports = Protein;


