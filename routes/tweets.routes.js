const router = require('express').Router();
const { handleRoomMessage } = require('../controllers/message.controller');
const { tweetCreate,
    tweetList, 
    tweetsNew, 
    tweetDelete, 
    tweetEdit, 
    tweetUpdate,
    commentTweet,
    likeTweet,
    getTweetAllComs
} = require('../controllers/tweets.controller');
const upload = require('../middleware/multer');
const { tweetSanitization, comSanitization } = require('../middleware/input-validate');

router.get('/', tweetList );                                                         // Homepage avec map de tweet
router.get('/tweet/new', tweetsNew );                                                // Affichage du formulaire de nouveau tweet
router.post('/', upload.single('tweet-image'), tweetSanitization, tweetCreate);                         // Envoi du nouveau tweet 
router.get('/edit/:tweetId', tweetEdit );                                            // ouverture du form de modification de tweet
router.post('/update/:tweetId', upload.single('tweet-image'), tweetSanitization, tweetUpdate);          // Modification d'un tweet
router.delete('/:tweetId', tweetDelete );                                            // Supprimer un tweet
router.get('/messagesroom/:roomId', handleRoomMessage)                               // récupéré les messages d'une room

// partis com
router.post('/coms/newcom/:tweetId', comSanitization, commentTweet )                                  // Commenter un tweet
router.get('/like/:tweetId', likeTweet);                                             // Like/Dislike un tweet
router.get('/coms/getcoms/:tweetId', getTweetAllComs)                                // Récupération de tous les commentaires d'un tweet

module.exports = router;