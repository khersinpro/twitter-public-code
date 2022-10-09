require("dotenv").config();
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const { findUserPerId } = require('../queries/users.queries');
const app = require('../app');

// Création du token 
const createJwtToken = ({ user = null, id = null }) => {
  const jwtToken = jwt.sign({ 
    sub: id || user._id.toString(),
    exp: Math.floor(Date.now() / 1000) + 5 
  }, secret);
  return jwtToken;
}

exports.createJwtToken = createJwtToken;

// Vérification de l'expiration du token
const checkExpirationToken = (token, res) => {
  const tokenExp = token.exp;                              // Date prévu expiration du token
  const nowInSec = Math.floor(Date.now() / 1000);          // Date actuelle transformé en seconde
  if (nowInSec <= tokenExp) {                              // Si le token n'est pas expiré , on retourne le token
    return token
  } else if (nowInSec > tokenExp && ((nowInSec - tokenExp) < 60 * 60 * 24) ) { // Si il est expiré depuis moins de 24h, on refraichit le token
    const refreshedToken = createJwtToken({ id: token.sub });
    res.cookie('jwt', refreshedToken, {secure: true, maxAge: 900000, httpOnly: true});
    return jwt.verify(refreshedToken, secret)
  } else {                                                                // Sinon on throw l'erreur
    throw new Error('token expired');
  }
}

// Extraction de l'utilisateur du token
const extractUserFromToken = async (req, res, next) => {
  try {
      const token = req.cookies.jwt;
      if (token) {
        let decodedToken = jwt.verify(token, secret, { ignoreExpiration: true }); // decrypte le token
        decodedToken = checkExpirationToken(decodedToken, res);                   // controle de l'expiration
        const user = await findUserPerId(decodedToken.sub);                       // recherche de l'utilisateur
        if (user) {
          req.user = user;                                                        // on place l'utilisateur dans le req.user si tout est bon
          next();
        } else {
          res.clearCookie('jwt');                                                  
          res.redirect('/auth/signin/form')
        }
      } else {
        next();
      }
    } catch(e) {
      res.clearCookie('jwt');
      res.redirect('/auth/signin/form')
    }
}

const addJwtFeatures = (req, res, next) => {
  req.isAuthenticated = () => !!req.user;
  req.logout = () => res.clearCookie('jwt')
  req.login = (user) => {
    const token = createJwtToken({ user });
    res.cookie('jwt', token, {secure: true, maxAge: 900000, httpOnly: true});
  }
  next();
}

app.use(extractUserFromToken);
app.use(addJwtFeatures);