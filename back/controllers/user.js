// importer modele utilisateur
const User = require('../models/user');

//importer bcrypt
const bcrypt = require('bcrypt');
// importer json web token
const jwt = require('jsonwebtoken');
// importer password-validator
const pwVal = require("password-validator");

//------methode pour creer un utilisateur
exports.signup = (req, res, next) => {
    (function reqValidation() {
        //---utilisation d'un regex pour valider l'email
        const emailValidator = new RegExp(/^([a-z0-9._-]+)@([a-z0-9]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/, 'g');
        
        //---configurer password-validator
        const pwValSchema = new pwVal();
        // ajouter des proprietes
        pwValSchema
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase(2)                              // Must have uppercase letters
        .has().lowercase(2)                              // Must have lowercase letters
        .has().digits(2)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

        // Verification de la requete
        if(pwValSchema.validate(req.body.password) && emailValidator.test(req.body.email)){
            //---hasher le mdp avec bcrypt
            bcrypt.hash(req.body.password, 10)
            .then(hash => {
                // on met le hash et l'email dans l'objet utilisateur
                const user = new User({
                    email : req.body.email,
                    password : hash
                });
                // on sauve la reponse dans la base de donnee
                user.save()
                // message de confirmation
                .then(() => res.status(201).json({message : 'utilisateur cree !'}))
                // message d'erreurs
                .catch(error => res.status(400).json({message : 'bad request'}));
            })
            .catch(error => res.status(500).json({error}));
        // si il est faible
        }else{
            return res.status(400).json({message : "le mot de passe n'est pas assez fort : il doit contenir au minimum 2 chiffres, 2 minuscules et 2 majuscules; il doit etre d'une longueur minimum de 8 caracteres"});
        }
    })();
};

//------methode pour ajouter un utilisateur
exports.login = (req, res, next) => {
    User.findOne({ email : req.body.email})
    .then(user => {
        if (!user) {
            // le message d'erreur est volontairement flou (fuite d'erreur)
            return res.status(401).json({ message : 'Paire login/mot de passe incorrecte'});
        };
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                res.status(401).json({ message : 'Paire login/mot de passe incorrecte'});
            };
            res.status(200).json({
                userId : user._id,
                token : jwt.sign(
                    {userId : user._id},
                    process.env.RANDOM_TOKEN,
                    { expiresIn : '24h'}
                )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};