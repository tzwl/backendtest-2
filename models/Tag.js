const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userid:{
    type: String,
    ref: 'User'
  }
},{timestamps: true});

module.exports = mongoose.model('Tag', authorSchema)