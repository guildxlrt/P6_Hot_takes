// importer le modele
const Sauce = require('../models/sauce');
// pour pouvoir utiliser le programme FS 
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
    // on applique une recherche ciblee
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
    // puis on enregistre l'objet
    sauce.save()
    .then(() => res.status(201).json({ message : 'objet enregistre !'}))
    .catch(error => res.status(400).json({error}));
};

// MODIFIER
exports.modifySauce = (req, res, next) => {
    //------Verifier la presence ou absence de fichier
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        // generer l'url par grace aux proprietes
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    // si ce n'est pas le cas on recupere l'objet dans le corps de la requete
    } : { ...req.body };

    // on prefera supprimer l'userID par mesure de securite
    delete sauceObject._userId;

    // Recuperer l'objet
    Sauce.findOne({ _id : req.params.id })
    .then((sauce) => {
        // si l'utilisateur n'est pas l'auteur
        if (sauce.userId != req.auth.userId) {
            // on renvoit une erreur d'authentification
            res.status(401).json({message : 'Non-autoirise'})
        // si il s'agit de l'auteur
        } else {
            // si il a une nouvelle image, on supprime l'ancienne
            if (req.file) {
                // recuperer le nom du fichier via l'url enregistree
                const filename = sauce.imageUrl.split('/images/')[1];
                // suppression du fichier image
                fs.unlink(`images/${filename}`, (err) => {
                    // gestion des erreurs
                    if (err) {
                        console.log("Echec lors de la suppression de l'ancienne image : "+err)
                    } else {
                        console.log("le fichier de l'ancienne image a ete supprime")
                    }
                })
            }
            // on met a jour l'objet
            Sauce.updateOne({ _id : req.params.id }, {...sauceObject, _id : req.params.id })
            .then(() => res.status(200).json({message : 'objet modifie !'}))
            .catch(error => res.status(401).json({error}));
        }
    })
};

// SUPPRIMER
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id : req.params.id })
        // Verification de l'identite de l'utilisateur
        .then(sauce => {
            // si ce n'est pas l'auteur
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message : 'not authorized'})
            // si c'est l'auteur
            } else {
                // recuperer le nom du fichier via l'url enregistree
                const filename = sauce.imageUrl.split('/images/')[1];
                // suppression du fichier image
                fs.unlink(`images/${filename}`, (err) => {
                    // gestion des erreurs
                    if (err) {
                        console.log("Echec lors de la suppression de l'image : "+err)
                    } else {
                        console.log("le fichier de l'ancienne image a ete supprime")
                    }
                    // suppression de la bdd
                    Sauce.deleteOne({ _id : req.params.id })
                    .then(() => res.status(200).json({message : 'objet supprime !'}))
                    .catch(error => res.status(401).json({error}))
                })
            }
        })
        .catch(error => res.status(500).json({error})); 
};


// LIKER
exports.likeSauce = (req, res, next) => {
    // On cherche dans l'objet
    Sauce.findOne({ _id : req.params.id })
    .then(async sauce => {
        // recuperation des utilisateurs dans la sauce
        const findLike = sauce.usersLiked.includes(req.body.userId);
        const findDislike = sauce.usersDisliked.includes(req.body.userId);

        //---Identification de l'utilisateur
        // en cas de reussite
        if (req.body.userId === req.auth.userId) {
            //-------Gestion des avis
            switch (req.body.like) {
                //---LIKE
                case 1 :
                    if (!findLike && !findDislike) {
                        // on ajoute le like dans la bdd
                        await Sauce.findByIdAndUpdate(
                            req.params.id,
                            { 
                                likes : sauce.likes += 1,
                                $addToSet : {usersLiked : req.body.userId}
                            }
                        )
                    }
                    else {
                        console.log("il est interdit de liker/disliker plus d'une fois ou de l'effectuer en parallele")
                    };
                    break;
                //---DISLIKE
                case -1 :
                    if (!findDislike && !findLike) {
                        // on ajoute le dislike dans la bdd
                        await Sauce.findByIdAndUpdate(
                            req.params.id,
                            { 
                                dislikes : sauce.dislikes += 1,
                                $addToSet : {usersDisliked : req.body.userId}
                            }
                        )
                    }
                    else {
                        console.log("il est interdit de disliker/liker plus d'une fois ou de l'effectuer en parallele")
                    };
                    break;
                //---ANNULATION
                case 0 :
                    // LIKE
                    if (findLike) {
                        // on retire le like
                        await Sauce.findByIdAndUpdate(
                            req.params.id,
                            { 
                                likes : sauce.likes -= 1,
                                $pull : {usersLiked : req.body.userId}
                            }
                        )
                    }
                    // DISLIKE
                    else if (findDislike) {
                        // on retire le dislike
                        await Sauce.findByIdAndUpdate(
                            req.params.id,
                            { 
                                dislikes : sauce.dislikes -= 1,
                                $pull : {usersDisliked : req.body.userId}
                            }
                        )
                    }
                    else {
                        console.log("Impossible d'annuler le like/dislike")
                    }
                    break;
                default :
                    console.log("Erreur Requete")
            }
        }
        // en cas d'echec
        else {
            console.log('Acces Non Authorise')
        }
    })
    .then(() => res.status(201).json({ message : "OK"}))
    .catch(error => res.status(500).json({error}));
};