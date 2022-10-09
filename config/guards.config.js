require("dotenv").config();
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie'); // pour crée un objet cookie a partir des headers
const { findUserPerId } = require('../queries/users.queries');

exports.ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/auth/signin/form');
    }
};

// Control de token coté socketIo
exports.autorisation = async (request, sucess) => {
    try {
        const cookies = cookieParser.parse( request.headers.cookie || "" );
        if(cookies && cookies.jwt){
            const decodedToken = jwt.verify(cookies.jwt, secret);
            if(decodedToken){
                const user = await findUserPerId(decodedToken.sub);
                if(user){
                    request.user = user;
                    sucess(null, true)
                }else{
                    sucess(null, false)
                }
            }else{
                sucess(403, false)
            }
        }else{
            sucess(403, false)
        }
    } catch(e) {
        sucess(400, false)
    }
}