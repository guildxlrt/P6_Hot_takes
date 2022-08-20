// importer le package http de node
const http = require('http');

// importer l'appli
const app = require('./app');

// par defaut on utilise le port 3000 pour lancer l'application
app.set('port', process.env.PORT || 3000);

// appeller la methode create server du package https
const server = http.createServer(app);

// le serveur doit ecouter, attendre les requetes
server.listen(process.env.PORT || 3000);