const router = require('express').Router();
const tweets = require('./tweets.routes');
const users = require('./users.routes')
const auth = require('./auth.routes')
const csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });
const {ensureAuthenticated} = require('../config/guards.config');

// Router pour création de compte et gerer les mdp, photo de profil ...
router.use('/users', users);

// Router pour la gestion, création , modification des tweets avec une gestions de commentaires
router.use('/tweets', ensureAuthenticated, csrfProtection, tweets);

// Router pour la connexion/deconnexion d'un utilisateur
router.use('/auth', auth)



// Router de redirection
router.get('/', (req, res) => {
    res.redirect('/tweets')
})

module.exports = router;