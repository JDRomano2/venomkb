const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
  protein_refs: { type: Array, required: true },
  target_name: { type: String, required: true },
  target_description: String,
  target_genes: Array,
  implicated_diseases: Array
});

const Target = mongoose.model('Target', TargetSchema);

module.exports = Target;
