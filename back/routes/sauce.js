const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauce');

// Afficher tout les sauces
router.get('/', auth, saucesCtrl.getAllSauces);
// afficher une sauce
router.get('/:id', auth, saucesCtrl.getOneSauce);
// enregistrer une sauce
router.post('/', auth, multer, saucesCtrl.createSauce);
// modifier une sauce
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
// supprimer la sauce
router.delete('/:id', auth, saucesCtrl.deleteSauce);
// like & dislike
router.post('/:id/like', auth, saucesCtrl.likeSauce);

module.exports = router;