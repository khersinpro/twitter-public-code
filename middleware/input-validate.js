const { body, validationResult } = require('express-validator');
//*** numeric and letter _ . - + numeric and letters min 2 max 10 + letters min 2 max 5 ***/
const emailReg = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
//*** Minimum 12 characters, at least one uppercase letter, one lowercase letter, one number and one special character ***/
const passwordReg = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+])(?=\\S+$).{12,}$";
//***Doit contenir 1 lettre mini, peut contenir -/ /' ***/
const nameReg = "^[a-zA-Zéèàîïùâ]+(([' -][a-zA-Z])?[a-zA-Zéèàîïùâ]*)*$";

// Controle des entrées pour la création d'utilisateur
exports.signupControl = (req, res, next) => {
    const {username, email, password} = req.body;
    if(!username.match(nameReg)){
        res.status(400).json({error: "Format d'username incorrect."})
    }else if(!email.match(emailReg)){
        res.status(400).json({error: "Format d'email incorrect"})
    }else if(!password.match(passwordReg)){
        res.status(400).json({error: "Format de mot de passe incorrect"})
    }else{
        next()
    }
}

// Controle des entrées pour la connexion d'utilisateur
exports.signinControl = (req, res, next) => {
    const {email, password} = req.body;
    if(!email.match(emailReg)){
        res.status(400).json({error: "Format d'email incorrect"})
    }else if(!password.match(passwordReg)){
        res.status(400).json({error: "Format de mot de passe incorrect"})
    }else{
        next()
    }
}
// Protection des com contre les injections
exports.tweetSanitization =  [
    body('content').optional().not().isEmpty().trim().blacklist(`<>"/&`).withMessage("Le message est vide"), 
    body('content').optional().not().isEmpty().trim().withMessage("Le message est vide ou contient de mauvais caractéres"),
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }
]


exports.comSanitization =  [
    body('commentValue').not().isEmpty().trim().blacklist(`<>"/&`).withMessage("Le commentaire est vide"), 
    body('commentValue').not().isEmpty().trim().withMessage("Le commentaire est vide ou contient de mauvais caractéres"),
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }
]