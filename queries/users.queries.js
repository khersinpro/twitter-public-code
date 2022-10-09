const User = require('../database/models/user.model')
const { v4: uuidv4 } = require('uuid'); // generation de string pour crée un token unique et aléatoire

// Querie de création d'utilisateur
exports.createUser = async (user) => {
    try {
        const hashPassword = await User.hashPassword(user.password); // recupération de la fonction statics du model User 'hashPassword'
        const newUser = new User({
            username: user.username,
            local: {
                email: user.email,
                password: hashPassword,
                emailToken: uuidv4()
            }
        })
        return newUser.save() // On retour la promesse a la fin du cheminement
    } catch(e) {
        throw e;
    }
};
// Querie de recupération d'un user par email
exports.findUserPerEmail = (email) => {
    return User.findOne({'local.email' : email }).exec();
};
// Querie de recupération d'un user par ID
exports.findUserPerId = (id) => {
    return User.findById(id).exec();
};

// Récupération de l'user par son username
exports.getUserPerUsername = (username) => {
    return User.findOne({ username }, {avatar: 1, username: 1, following: 1, local : {emailVerified: 1}}).exec();
};

// Querie de recuperation des users de la recherche utilisateur
exports.searchUsersPerUsername = (search) => {
    const reg = new RegExp(`^${search}`); // Création de la regex pour la query find
    // L'operateur $regex permet de trouver des element commençant par un string mais on doit obligatoirement lui passer une regex
    return User.find({username: {$regex : reg }},{ avatar: 1, username: 1 }).exec();
}

// Ajouter un user a ses follow
exports.addUserIdToCurrentUserFollowing = (currentUser, userId) => {
    currentUser.following = [ ...currentUser.following, userId];
    return currentUser.save()
}

// retirer un user a ses follow
exports.removeUserIdToCurrentUserFollowing = (currentUser, userId) => {
    currentUser.following = currentUser.following.filter(uid => uid.toString() !== userId)
    return currentUser.save()
}