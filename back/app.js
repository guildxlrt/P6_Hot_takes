//importer express
const express = require('express');
// acceder au path
const path = require('path');
// utilisation de dotenv
require('dotenv').config()


// importer user
const userRoutes = require('./routes/user');
// importer user
const sauceRoutes = require('./routes/sauce');

// appeller express via l'app
const app = express();
// json middleware
app.use(express.json());

// importer mongoose
const mongoose = require('mongoose');
// connecter a mangodb
mongoose.connect( process.env.SECRET_DB,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Autorisation d'acces aux ressources
app.use((req, res, next) => {
    // acceder a l'api depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', '*');
    // ajouter des en-tetes
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // autorise des methodes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


// route images
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.static('images'));

// definir les routes
// utilisateurs
app.use('/api/auth', userRoutes);
// sauces
app.use('/api/sauces', sauceRoutes);


// exporter l'api
module.exports =  app;