const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // recuperer le header et splitter
        const token = req.headers.authorization.split(' ')[1];
        // decoder le token (mthode verify)
        const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN);
        // recuprer l'userId
        const userId = decodedToken.userId;
        // rajouter cette valeur a l'objet request
        req.auth = {
            userId : userId
        };
        next();
    }
    catch (error) {
        res.status(401).json({error});
    }
}