const express = require('express');
const router = express.Router();

// utiliser le controlleur
const userCtrl = require('../controllers/user');

//---importer les methodes
// creation du compte
router.post('/signup', userCtrl.signup);
// connexion
router.post('/login', userCtrl.login);

//exporter le routeur
module.exports = router;