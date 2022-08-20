const Sauce = require('../models/sauce');

const fs = require('fs')


// AFFICHER TOUT
exports.getAllSauces = (req, res, next) => {
    // on applique une recherche generale
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};
// AFFICHER UNE SEULE
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id : req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};

// ENREGISTRER
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    // plus besoin de l'id de l'objet, il sera recree
    delete sauceObject._id;
    // on prefera utiliser  l'userID du tokken d'identification
    delete sauceObject._userId;

    //creation a partir du model
    const sauce = new Sauce({
        // ce qui nous a ete passe moins les deux champs supprimes
        ...sauceObject,
        // on recupere l'usrID du tokken grace au middleware
        userId : req.auth.userId,
        // generer l'url par grace aux proprietes
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message : 'objet enregistre !'}))
    .catch(error => res.status(400).json({error}));
};

// MODIFIER
exports.modifySauce = (req, res, next) => {
    Sauce.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id})
            .then(() => res.status(200).json({message : 'objet modifie !'}))
            .catch(error => res.status(400).json({error}));
};
// SUPPRIMER
exports.deleteSauce= (req, res, next) => {
    Sauce.findOne({ _id : req.params.id })
    .then(res => {
        let filePath = './images/' + res.imageUrl.slice(29)
        fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log('path/file.txt was deleted')   
        })
    })

    Sauce.deleteOne({ _id : req.params.id })
    .then(() => res.status(200).json({message : 'objet supprime !'}))
    .catch(error => res.status(400).json({error}));
};


// LIKER
exports.likeSauce = (req, res, next) => {
    
};
