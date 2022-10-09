const mongoose = require("mongoose");
let devMethod = `../environment/${process.env.NODE_ENV}.js`.replace(/ /g, "");
const env = require(`../environment/${devMethod}`);

exports.clientPromise = mongoose.connect(
    env.dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
