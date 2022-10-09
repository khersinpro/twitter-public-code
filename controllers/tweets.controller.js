const { 
    getTweets, 
    createTweet, 
    deleteTweet, 
    getTweet, 
    updateTweet, 
    getCurrentUserTweetsWithFollowing, 
    tweetLike, 
    getAllComsPerTweetId 
} = require('../queries/tweets.queries');
const fs = require('fs');

// Récupération de la liste des tweet + render de la page tweet-list.pug
exports.tweetList = async (req, res, next) => {
    try {
        const tweets = await getCurrentUserTweetsWithFollowing(req.user);             // Récupération de tous les tweets
        res.render('tweets/tweet', {   
            csrfToken : req.csrfToken(),                                           
            tweets,                                                                   // Render de la page tweet-list avec les tweets en param
            isAuthenticated: req.isAuthenticated(),                                   // req.isAuthenticated() est mis a disposition par passport
            currentUser: req.user,                                                    // Pareil pour req.user 
            user: req.user,
            editable: true
        }); 
    } catch(e) {
        next(e);
    }
};

// Redirection vers la page de formulaire pour créer un tweet
exports.tweetsNew = async (req, res, next) => {
    try {
        const tweets = await getTweets()
        res.render('tweets/tweet-form', { 
            csrfToken : req.csrfToken(), 
            tweet: {},
            tweets,
            isAuthenticated: req.isAuthenticated(),
            currentUser: req.user,
            user: req.user
        });
    } catch(e) {
        next(e);
    }
};

// Création d'un tweet en base de donnée et redirection vers la page d'acceuil
exports.tweetCreate = async (req, res, next) => {
    try {
        const body = req.body;
        const image = req.file ? `/images/tweet-images/${req.file.filename}` : "";
        await createTweet({...body, 
            author: req.user._id,
            image  
        })
        res.status(200).json({message : "tweet crée", redirect: "/tweets"})    
    } catch(e) {
        if(e.errors){
            const errors = Object.keys(e.errors).map(key => e.errors[key].message); // Object key recuperer les clés un objet et les met sous forme d'array
            res.status(400).json(errors)                                            // Render le formulaire de création de tweet avec des errors
        } else {
            next(e);
        }
    }
};

// Suppression d'un tweet
exports.tweetDelete = async (req, res, next) => {
    try {
        const tweetId = req.params.tweetId;
        // User verification
        const tweetVerification = await getTweet(tweetId)
        if(tweetVerification.author.toString() !== req.user._id.toString()){
            req.logout()
            return res.redirect('/auth/signin/form');
        }
        const tweetDelete = await deleteTweet(tweetId);
        const tweets = await getCurrentUserTweetsWithFollowing(req.user);
        if(tweetDelete.image){
            fs.unlink("./public" + tweetDelete.image, err => {
                err && console.log(err)
            })
        }
        res.render('tweets/tweet-list', { 
            tweets,
            currentUser: req.user,
            editable: true
        });
    } catch(e) {
        next(e)
    }
}

// Ouverture de la page de modification de tweet
exports.tweetEdit = async (req, res, next) => {
    try {
        const tweetId = req.params.tweetId;
        const tweets = await getTweets();
        const tweet = await getTweet(tweetId);
        if(tweet.author.toString() !== req.user._id.toString()){
            req.logout();
            res.redirect('/auth/signin/form');
        } else {
            res.render('tweets/tweet-modify-form', { 
                csrfToken : req.csrfToken(), 
                tweet,
                tweets,
                isAuthenticated: req.isAuthenticated(),
                currentUser: req.user,
                user: req.user                   
            });
        }
    } catch(e) {
        next(e);
    }
}

// Mise a jour d'un tweet
exports.tweetUpdate = async (req, res, next) => {
    const tweetId = req.params.tweetId;
    try {
        const { content, deleteActualImg } = req.body;
        const image = req.file ? `/images/tweet-images/${req.file.filename}` : false;
        const tweet = {
            content,
            ...(image.length && { image }),
            ...(deleteActualImg === "true" && !image && { image: "" })  
        }
        const newTweet = await updateTweet(tweetId, tweet);
        if(newTweet.image.length && (image.length || deleteActualImg === "true" && !image )){
            fs.unlink("./public" + newTweet.image, err => {
                err && console.log(err)
            })
        }
        res.status(200).json({ message : "tweet modifié", redirect :'/tweets' });
    } catch(e) {
        if(e.errors){
            const errors = Object.keys(e.errors).map(key => e.errors[key].message); 
            res.status(400).json(errors)                                            
        } else {
            next(e);
        }
    }
}

// commenter un tweet
exports.commentTweet = async (req, res, next) => {
    try {
        const tweet = await getTweet(req.params.tweetId)
        const comLength = tweet.comments.length;
        const com = {
                comAuthor: req.user._id,
                comAuthorName:req.user.username,
                comContent: req.body.commentValue,
                date: new Date()    
        }  

        tweet.comments.push(com);
        tweet.nbofcoms++;
        await tweet.save()
        await tweet.populate('comments.comAuthor', "avatar")
        const newComs = tweet.comments.slice(comLength);  // Récupération des nouveaux commentaires
        res.status(200).json({ newComs, nbofcoms: tweet.nbofcoms });
    } catch(e) {
        next(e);
    }
}

// like/dislike
exports.likeTweet = async (req, res, next) => {
    try {
        const tweet = await getTweet(req.params.tweetId);
        if(tweet){
            if(tweet.likes.includes(req.user._id)){
                await tweetLike(req.params.tweetId, {$pull: {likes : req.user._id}})
                res.status(200).json({message: "Dislike effectué", nboflikes: tweet.likes.length - 1, data: 0})
            } else {
                await tweetLike(req.params.tweetId, { $push: {likes : req.user._id} })
                res.status(200).json({message: "Like effectué", nboflikes: tweet.likes.length + 1, data: 1 })
            }
        }else{
            res.status(404).json({message: "No results found."})
        }
    } catch(e) {
        next(e);
    }
}

// Récupération de tous les coms d'un tweet
exports.getTweetAllComs = async (req, res, next) => {
    try {
        const allComs = await getAllComsPerTweetId(req.params.tweetId)
        res.status(200).json(allComs)
    } catch(e) {
        next(e);
    }
}