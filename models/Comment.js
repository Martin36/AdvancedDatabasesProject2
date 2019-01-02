const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  date: Date,
});

module.exports = mongoose.model('Comment', commentSchema);
