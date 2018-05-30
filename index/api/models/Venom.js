const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const VenomSchema = new mongoose.Schema({
    name: String,
    proteins: [{ type: mongoose.Schema.ObjectId, ref: 'Protein' }],
});

module.exports = mongoose.model('Venom', VenomSchema);
