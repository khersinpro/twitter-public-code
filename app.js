const express = require('express');
const helmet = require('helmet');
const app = express();
module.exports = app;
const path = require('path');
const morgan = require('morgan');
const index = require('./routes');
const errorHandler = require('errorhandler');
const cookieParser = require('cookie-parser');
require('./database');

app.set('views', path.join(__dirname, 'views'));         // Récupération des vues grace a path pour avoir le chemin absolu
app.set('view engine', 'pug');                           // Spécification du view engine => .pug

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
        directives: {
            "script-src": [
                "'self'", 
                "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js", 
                "https://cdn.jsdelivr.net/npm/sweetalert2@11",
            ], 
            imgSrc: ["'self'", "blob:"]
        },
    })
);
app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(cookieParser())
require('./config/jwt.config');

// app.use(morgan("short"));
app.use(express.static(path.join(__dirname, 'public')))  // Récupération des données static dans le folder public image/css/js
app.use(express.json());
app.use(express.urlencoded({extended: true}));           // Permet de recupéré les données envoyer a l'api differente du json
app.use(index);

//Middleware de gestion d'erreur
if(process.env.NODE_ENV === "development "){ 
    app.use(errorHandler());
} else {
    app.use((err, req, res, next) => {
        const code = err.code || 500;
        res.status(code).json({
            code,
            message: code === 500 ? null : err.message
        })
    })
}



