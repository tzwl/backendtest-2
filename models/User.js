const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  Login:{
    type: String,
    required:true
  },
  password: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true,
    validate:/^[a-zA-Z]+$/
  },
  lastname: {
    type: String,
    required: true,
    validate:/^[a-zA-Z]+$/
  },
  gender: {
    type: String,
    required: true,
    enum:["M","F"]
  },
  email: {
    type: String,
    required: true,
    validate:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  phonenum: {
    type: String,
    required: true,
    validate:/[+][(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*/
  },
  isadmin:{
    type: Boolean,
    required: true
  }
  
},{timestamps: true});

module.exports = mongoose.model('User', authorSchema)