const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  publication: {
    type: String,
    trim: true,
  },
  author: {
    type: String,
  },
  date: {}
});

module.exports = mongoose.model('Article', articleSchema);
