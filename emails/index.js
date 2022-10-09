const nodemailer = require('nodemailer');
const sparkPostTransporter = require('nodemailer-sparkpost-transport');
const path = require('path');
const pug = require('pug');
require('dotenv').config();

class Email {

    constructor() {
        // Nous affichons comme nom d'expéditeur Twitter project
        // Nous utilisons le contact@k-hersin.com comme adresse d'envoi.
        this.from = 'Twitter project <contact@k-hersin.com>';
        if(process.env.NODE_ENV === 'production'){
            // Nous créons notre transporteur qui utilise SparkPost pour la production 
            this.transporter = nodemailer.createTransport(sparkPostTransporter({    // Transporteur d'email reel vers des clients avec sparkpost
                sparkPostApiKey: process.env.API_EMAIL_KEY                          // clés api de sparkpost liée a notre projet
                                           // redirection vers sparkpost
            }))
        }else{
            // Pour le développement nous utilisons Mailtrap pour faire les essaies
            this.transporter =  nodemailer.createTransport({ 
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: process.env.API_EMAIL_USER,
                    pass: process.env.API_EMAIL_PASS
                }
            })
        }
    }
    // Nous créons la méthode pour envoyer l'email permettant la validation
    // de l'email de l'utilisateur :
    async sendEmailVerification(options) {
        try {
            const email = {
                // Nous utilisons l'expéditeur défini sur la classe 
                from: this.from,
                // Sujet de l'email
                subject: 'Email Verification',
                // Destinataire
                to: options.to,
                // Contenu de l'email au format html 
                html: pug.renderFile(
                    // Nous passerons le pseudo en options qui sera affiché dans l'email :
                    path.join(__dirname, 'templates/email-verification.pug'), 
                    {
                        // Pour le lien de validation, nous avons besoin de l'id de l'utilisateur et du token.
                        // Nous passons également l'hôte en options
                        username: options.username, 
                        url:`https://${options.host}/users/email-verification/${options.userId}/${options.token}`
                    }
                )
            }
            const response = await this.transporter.sendMail(email);
        } catch(e) {
            throw e;
        }
    }

    async sendResetPasswordLink(options) {
        try {
            this.from = 'Reinitilisation de mot de passe <contact@k-hersin.com>';
            const email = {
                // Nous utilisons l'expéditeur défini sur la classe 
                from: this.from,
                // Sujet de l'email
                subject: 'Password reset',
                // Destinataire
                to: options.to,
                // Contenu de l'email au format html 
                html: pug.renderFile(
                    // Nous passerons le pseudo en options qui sera affiché dans l'email :
                    path.join(__dirname, 'templates/password-reset.pug'), 
                    {
                        // Pour le lien de validation, nous avons besoin de l'id de l'utilisateur et du token.
                        // Nous passons également l'hôte en options
                        username: options.username, 
                        url:`https://${options.host}/users/reset-password/${options.userId}/${options.token}`
                    }
                )
            }
            const response = await this.transporter.sendMail(email);
            console.log(response);
        } catch(e) {
            throw e;
        }
    }
}

module.exports = new Email();