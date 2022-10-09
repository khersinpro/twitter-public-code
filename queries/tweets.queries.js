const Tweet = require('../database/models/tweet.model');

// Récupération des tous les tweets
exports.getTweets = () => {
    return Tweet.find({}).exec();
};

// Création d'un tweet
exports.createTweet = (tweet) => {
    const newTweet = new Tweet(tweet);
    return newTweet.save();
};

// Suppression d'un tweet
exports.deleteTweet = (tweetId) => {
    return Tweet.findByIdAndDelete(tweetId).exec();
};

// Récupération d'un tweet
exports.getTweet = (tweetId) => {
    return Tweet.findOne({_id : tweetId}).exec();
};

// MaJ d'un tweet
exports.updateTweet = (tweetId, tweet) => {
    return Tweet.findByIdAndUpdate(tweetId, {$set: tweet }, {runValidators: true}); //runValidators permet de controller les exigeance du Schema du tweet même en mode modification **
};

// Récuperation des tweets de l'utilisateur et de ses follower
exports.getCurrentUserTweetsWithFollowing = (user) => {                
    return Tweet.find({ author: { $in: [ ...user.following, user._id ] } })  // L'operateur $in permet d'apliquer la querie pour chaque element d'un tableau
    .sort({ createdAt : -1 })
    .populate('author',['avatar','username']).exec();                                              // Il recherchera les tweets reliée a chaque auteur qui se trouve dans le tableau sous form d'id
}

// Récupération des tweets d'un utilisateur
exports.getTweetsFromAuthorId = (authorId) => {
    return Tweet.find({ author: authorId }).populate('author',['avatar','username']).exec();
}

// Ajout d'un commentaire dans un tweet
exports.addCom = (tweetId, comment) => {
    return Tweet.findByIdAndUpdate(tweetId, {$push : {comments : comment}, $inc : {nbofcoms: +1}}).exec()
}

// ajouter/retirer un like d'un tweet
exports.tweetLike = (tweetId, params)  => {
    return Tweet.updateOne({_id: tweetId}, params).exec()
}

// Récupérer tout les coms d'un tweet
exports.getAllComsPerTweetId = (tweetId) => {
    return Tweet.findById(tweetId, "comments").populate('comments.comAuthor', "avatar").exec()
}

// Récupéré un com par sa date
exports.getOneCom = (tweetId, comDate) => {
    return Tweet.findById(tweetId, {"comments" : {date : comDate} }).populate('comments.comAuthor', "avatar").exec()
}
