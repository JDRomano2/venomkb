const mongoose = require('mongoose');

const DrugOutLinkSchema = new mongoose.Schema({
  database_or_taxonomy: { type: String, required: true },
  identifier: { type: String, required: true }
});

const DrugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand_names: { type: [String], default: undefined },
  molecular_weight: String,
  image_url: String,
  out_links: { type: [DrugOutLinkSchema] }
});

const Drug = mongoose.model('Drug', DrugSchema);

Drug.getAll = () => {
  return new Promise((resolve, reject) => {
    Drug.find({})
      .exec((err, _drugs) => {
        if (err) reject (err);
        resolve(_drugs);
      });
  });
};

Drug.getByVenomKBId = (venomkb_id) => {
  return new Promise((resolve, reject) => {
    Drug.findOne({ venomkb_id: venomkb_id })
      .populate('out_links')
      .exec((err, _drug) => {
        if (err) {
          reject(err);
        }
        resolve(_drug);
      });
  });
};

Drug.getById = (id) => {
  return new Promise((resolve, reject) => {
    Drug.findOne({ _id: id })
      .populate('out_links')
      .exec((err, _drug) => {
        if (err) {
          reject(err);
        }
        resolve(_drug);
      });
  });
};

Drug.getByName = (name, path) => {
  return new Promise((resolve, reject) => {
    Drug.find({ $text: { $search: name } })
      .populate(path || '')
      .exec((err, _drugs) => {
        if (err) {
          reject(err);
        }
        resolve(_drugs);
      });
  });
};

Drug.getIndex = () => {
  return new Promise((resolve, reject) => {
    Drug.find({}, { venomkb_id: 1, name: 1 })
      .exec((err, _drugs) => {
        if (err) {
          reject(err);
        }
        resolve(_drugs);
      });
  });
};

Drug.add = new__drug => {
  return new Promise((resolve, reject) => {
    Drug.create(new__drug, (err, created__drug) => {
      if (err) reject(err);
      resolve(created__drug);
    });
  });
};

module.exports = Drug;
// module.exports = {
//   Drug: Drug,
//   DrugSchema: DrugSchema
// };
