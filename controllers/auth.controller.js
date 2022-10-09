const { findUserPerEmail } = require('../queries/users.queries');


// Render le formulaire de connexion
exports.signinForm = (req, res, next) => {
    res.render('auth/auth-form', {
        errors: null,
        isAuthenticated: req.isAuthenticated(),
        currentUser: req.user
    });
};
// Connexion via la base de donnée
exports.signin = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        if(email && password){
            const user = await findUserPerEmail(email);
            if(!user){
                return res.status(401).json({error: "L'email ou le mot de passe est incorrect."})
            }
            const match = await user.comparePassword(password)
            if(!match){
                return res.status(401).json({error: "L'email ou le mot de passe est incorrect."})
            }
            req.login(user); 
            res.redirect('/')
        }else{
            res.redirect('/auth/signin/form');
        }
    } catch(e) {
        next(e);
    }
};
// Déconnexion
exports.signout = (req, res, next) => {
    req.logout();                       
    res.redirect('/auth/signin/form');
};