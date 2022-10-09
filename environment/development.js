require("dotenv").config();
const path = require('path');

module.exports = {
    dbUrl : `mongodb+srv://${process.env.MONGO}@cluster0.il6po1g.mongodb.net/twitter?retryWrites=true&w=majority`,
    cert: path.join(__dirname, '../ssl/cert.pem'),
    key: path.join(__dirname, '../ssl/key.pem')
}
