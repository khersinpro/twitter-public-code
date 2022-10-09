const mongoose = require('mongoose');
const schema = mongoose.Schema;

const tweetSchema = schema({
    content : {
        type: String, 
        maxlength: [140, "Tweet trop long"], 
        minlength: [1, "Tweet trop court"], 
        required: [true, "Champ requis"]
    },
    image: String,
    nbofcoms: {type: Number, default: 0},
    comments: {
        type: [{
            comAuthor: {type: schema.Types.ObjectId, ref: 'user', required: [true, "Champ requis"]},
            comAuthorName: { type: String, required: [true, "Champ requis"]},
            comContent: { type: String, minlength: [1, "Commentaire trop court"], required: [true, "Champ requis"] },
            date: {type: Date, required: [true, "Champ requis"]}
        }]
    },
    likes : {type: [schema.Types.ObjectId]},
    author: {type: schema.Types.ObjectId, ref: 'user', required: true} // ref pour pouvoir populate avec les info utilisateur (objectId)
}, { timestamps: true } );

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;