const mongoose = require('mongoose');

const OutLinkSchema = new mongoose.Schema({
    ressource: String,
    primary_id: String,
    attribute: String,
});

module.exports = mongoose.model('Outlink', OutlinkSchema);
