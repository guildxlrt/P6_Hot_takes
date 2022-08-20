// importer mongoose
const mongoose = require('mongoose');

// importer le validateur
const uniqueValidator = require('mongoose-unique-validator');

// modele pour creer utilisateur
const userSchema = mongoose.Schema({
  email : { type : String, required : true, unique : true },
  password : { type : String, required : true }
});

// controller l'unicite
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);