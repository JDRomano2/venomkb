const mongoose = require('mongoose');

// Schema to enforce consistent structure.
const TaxonomicSchema = new mongoose.Schema({
    taxomName: String,
    itis_tsn: String,
    rankName: String
});


module.exports = mongoose.model('Taxonomic', TaxonomicSchema);
