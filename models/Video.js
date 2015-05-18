var mongoose = require('mongoose'),
    mongooseSearch = require('mongoose-search-plugin'),
    crypto = require('crypto');

var schema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  tags: [ String ],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

/**
 * Update the date on a post when it is modifeid
 */
schema.pre('save', function(next) {
  if (!this.isNew)
    this.updated = new Date();

  next();
});

schema.plugin(mongooseSearch, {
  fields: ['name', 'description', 'tags']
});

module.exports = mongoose.model('Video', schema);