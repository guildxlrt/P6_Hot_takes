const mongoose =  require('mongoose');

// modele de "sauce"
const sauceSchema =  mongoose.Schema({
    userId : {type : String, require : true},
    name : {type : String, require : true},
    manufacturer : {type : String, require : true},
    description : {type : String, require : true},
    mainPepper : {type : String, require : true},
    imageUrl : {type : String, require : true},
    heat : {type : Number, require : true},
    likes : {type : Number, default : 0, require : true},
    dislikes : {type : Number, default : 0, require : true},
    usersLiked : {type : [ "String <userId>" ], require : true},
    usersDisliked : {type : [ "String <userId>" ], require : true},
});

module.exports = mongoose.model('sauce', sauceSchema);
