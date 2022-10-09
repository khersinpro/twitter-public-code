const {
    createUser,
    getUserPerUsername,
    searchUsersPerUsername,
    addUserIdToCurrentUserFollowing,
    findUserPerId,
    removeUserIdToCurrentUserFollowing,
    findUserPerEmail 
} = require('../queries/users.queries');
const { v4: uuidv4 } = require('uuid'); // generation de string pour crée un token unique et aléatoire
const { getTweetsFromAuthorId } = require('../queries/tweets.queries');
const fs = require('fs');
const User = require('../database/models/user.model');
const moment = require('moment');
const emailFactory = require('../emails');



// Render la page de création de compte
exports.signupForm = (req, res, next) => {
    res.render('users/user-form', { 
        errors: null,
        isAuthenticated: req.isAuthenticated(),
        currentUser: req.user
    });
};

// Gestion de la création de la d'un utilisateur en base de donnée
exports.signup = async (req, res, next) => {
    const body = req.body;
    try {
        const user = await createUser(body);
        emailFactory.sendEmailVerification({
            to: user.local.email,
            username: user.username,
            host: req.headers.host,
            userId: user._id,
            token: user.local.emailToken
        })
        console.log('redirect');
        res.redirect('/');
    } catch(e) {
        if(e.errors){
            const error = Object.keys(e.errors).map(key => e.errors[key].message);
            res.status(400).json(error)
        }else if (e.code = 11000){
            if(e.keyPattern.username){
                res.status(400).json({error : "Ce username est déjà utilisé."})
            } else {
                res.status(400).json({error : "Email déjà utilisé."});
            }
        } else {
            next(e);
        }
    }
};

// Modification de l'avatar d'un user
exports.uploadImage = async  (req, res, next) => {
    try {
        const user = req.user;
        if(user.avatar !== '/images/images.png'){
            fs.unlink('./public' + user.avatar, (err) => {
                err && console.log(err)
            })
        } 
        user.avatar = '/images/avatars/' + req.file.filename;
        await user.save();

        res.redirect('/tweets');
    } catch(e) {
        next(e);
    }
};

// Affichage de la page d'un utilisateur
exports.userProfile = async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await getUserPerUsername(username);
        const tweets = await getTweetsFromAuthorId(user._id);
        res.render('tweets/tweet', {                 // Render de ka page tweet-list avec les tweets en param
            tweets, 
            isAuthenticated: req.isAuthenticated(),  // req.isAuthenticated() est mis a disposition par passport
            currentUser: req.user,                   // Pareil pour req.user qui donne les infos de l'user connecté
            user,                                    // user = a l'user qu'on a recuperer en params afin d'afficher sa page
            editable: false
        }); 
    } catch(e) {
        next(e);
    }
}

// Récupération des user rechercher par l'utilisateur
exports.userList = async (req, res, next) => {
    try {
        const search = req.query.search;
        const users = await searchUsersPerUsername(search);
        console.log(users);
        res.render('includes/search-menu', { users });
    } catch(e) {
        next(e);
    }
}

// Follow un user
exports.followUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const [adding, user] = await Promise.all([      // Promise all permet d'await plusieurs promesse d'un coup
            addUserIdToCurrentUserFollowing(req.user, userId),    //  ça permet d'avoir des resultats plus rapide
            findUserPerId(userId)
        ]);
        res.redirect('/users/' + user.username)
    } catch(e) {
        next(e);
    }
}

// Unfollow un user
exports.unfollowUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const [adding, user] = await Promise.all([      // Promise all permet d'await plusieurs promesse d'un coup
            removeUserIdToCurrentUserFollowing(req.user, userId),    //  ça permet d'avoir des resultats plus rapide
            findUserPerId(userId)
        ]);
        res.redirect('/users/' + user.username)
    } catch(e) {
        next(e);
    }
}

// Vérification d'email
exports.emailLinkVerification = async (req, res, next) => {
    try {
        const { userId, token } = req.params;                      // recupération de userId et du token dans les paramettres de la requetes 
        const user = await findUserPerId(userId);
        if (user && token && user.local.emailToken === token ){    // verification du token de validation de compte
            user.local.emailVerified = true;                        // On passe l'userVerified a true
            await user.save();                                     // Sauvegarde de l'user
            return res.redirect('/tweets');
        } else {
            return res.status(400).json('Problem during email verification');
        }
    } catch(e) {
        next(e);
    }
}

// Envoie de l'email de recupération de mot de passe
exports.initResetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        if(email){
            const user = await findUserPerEmail(email);
            if(user){
                user.local.passwordToken = uuidv4()
                // invocation de moment qui crée un objet moment equivalent a Date.now()
                // on lui ajoute 2 heures grace a add(2, hours)
                // et on l'extrait sous forme de date grace a toDate
                user.local.passwordTokenExpiration = moment().add(2, 'hours').toDate();
                await user.save()
                emailFactory.sendResetPasswordLink({
                    to: email,
                    host: req.headers.host,
                    userId: user._id,
                    token: user.local.passwordToken,
                    username: user.username
                })
                return res.status(200).end() 
            }
            return res.status(400).json('Utilisateur inconnu')
        }
    } catch(e) {
        next(e);
    }
}

// Render du formulaire de reinitialisation du mot de passe utilisateur
exports.resetPasswordForm = async (req, res, next) => {
    try {
        const { userId, token } = req.params;
        const user = await findUserPerId(userId);
        if(user && user.local.passwordToken === token) {        // Control du token en BDD est bien celui envoyer par l'utilisateur
            return res.render('auth/auth-reset-password', {
                error: null,
                isAuthenticated: false,
                url: `https://${req.headers.host}/users/reset-password/${user._id}/${user.local.passwordToken}`
            });
        } else {
            res.status(400).json("La récupération de mot de passe est invalide"); 
        }
    } catch(e) {
        next(e)
    }
}

// Réinitialisation du mot de passe utilisateur
exports.resetPassword = async (req, res, next) => {
    try {
        const { userId, token } = req.params;
        const { password } = req.body;
        const user = await findUserPerId(userId);
        if(
            password &&
            user && user.local.passwordToken === token 
            && moment() < moment(user.local.passwordTokenExpiration) // moment control si le passwordTokenExpiration n'est pas expiré
        ) {
            user.local.password = await User.hashPassword(password);
            user.local.passwordToken = null;
            user.local.passwordTokenExpiration = null;
            await user.save()
            res.redirect('/tweets');
        } else {
            return res.render('auth/auth-reset-password', {
                error: ['La demande de reinitisalition de mot de passe a éxpirée'],
                isAuthenticated: false,
                url: `https://${req.headers.host}/users/reset-password/${user._id}/${user.local.passwordToken}`
            });
        }
    } catch(e) {
        console.log("catch");
        next(e);
    }
}