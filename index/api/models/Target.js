const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
  protein_refs: { type: Array, required: true },
  target_name: { type: String, required: true },
  target_description: String,
  target_genes: Array,
  implicated_diseases: Array,
  pdb_structure: String
});

const Target = mongoose.model('Target', TargetSchema);

Target.getAll = () => {
  return new Promise((resolve, reject) => {
    Target.find({})
      .exec((err, _targets) => {
        if (err) reject (err);
        resolve(_targets);
      });
  });
};

Target.getByVenomKBId = (venomkb_id) => {
  return new Promise((resolve, reject) => {
    Target.findOne({ venomkb_id: venomkb_id })
      .exec((err, _target) => {
        if (err) {
          reject(err);
        }
        resolve(_target);
      });
  });
};

Target.getById = (id) => {
  return new Promise((resolve, reject) => {
    Target.findOne({ _id: id })
      .exec((err, _target) => {
        if (err) {
          reject(err);
        }
        resolve(_target);
      });
  });
};

Target.getByName = (name, path) => {
  return new Promise((resolve, reject) => {
    Target.find({ $text: { $search: name } })
      .exec((err, _targets) => {
        if (err) {
          reject(err);
        }
        resolve(_targets);
      });
  });
};

module.exports = Target;
