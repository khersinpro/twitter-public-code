require("dotenv").config();

module.exports = {
    dbUrl : `mongodb+srv://${process.env.MONGO}@cluster0.il6po1g.mongodb.net/twitter?retryWrites=true&w=majority`,
    cert: '/etc/letsencrypt/live/www.k-hersin.com/fullchain.pem',
    key: '/etc/letsencrypt/live/www.k-hersin.com/privkey.pem' 
};