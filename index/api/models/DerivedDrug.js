const mongoose = require('mongoose');

const DrugOutLink = new mongoose.Schema({
  database_or_taxonomy: { type: String, required: true },
  identifier: { type: String, required: true }
});

const DerivedDrugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand_names: { type: [String], default: undefined },
  derived_from_protein: { type: [String], required: true },
  molecular_weight: String,
  image_url: String,
  out_links: { type: [DrugOutLink] }
});

let DerivedDrug = mongoose.model('DerivedDrug', DerivedDrugSchema);

DerivedDrug.getAll = () => {
  return new Promise((resolve, reject) => {
    DerivedDrug.find({})
      .exec((err, derived_drugs) => {
        if (err) reject (err);
        resolve(derived_drugs);
      });
  });
};

DerivedDrug.getByVenomKBId = (venomkb_id) => {
  return new Promise((resolve, reject) => {
    DerivedDrug.findOne({ venomkb_id: venomkb_id })
      .populate('out_links')
      .exec((err, derived_drug) => {
        if (err) {
          reject(err);
        }
        resolve(derived_drug);
      });
  });
};

DerivedDrug.getById = (id) => {
  return new Promise((resolve, reject) => {
    DerivedDrug.findOne({ _id: id })
      .populate('out_links')
      .exec((err, derived_drug) => {
        if (err) {
          reject(err);
        }
        resolve(derived_drug);
      });
  });
};

DerivedDrug.getByName = (name, path) => {
  return new Promise((resolve, reject) => {
    DerivedDrug.find({ $text: { $search: name } })
      .populate(path || '')
      .exec((err, derived_drugs) => {
        if (err) {
          reject(err);
        }
        resolve(derived_drugs);
      });
  });
};

DerivedDrug.getIndex = () => {
  return new Promise((resolve, reject) => {
    DerivedDrug.find({}, { venomkb_id: 1, name: 1 })
      .exec((err, derived_drugs) => {
        if (err) {
          reject(err);
        }
        resolve(derived_drugs);
      });
  });
};

DerivedDrug.add = new_derived_drug => {
  return new Promise((resolve, reject) => {
    DerivedDrug.create(new_derived_drug, (err, created_derived_drug) => {
      if (err) reject(err);
      resolve(created_derived_drug);
    });
  });
};