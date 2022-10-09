const router = require('express').Router();
const {signin, signinForm, signout} = require('../controllers/auth.controller');
const { signinControl } =  require('../middleware/input-validate')

router.get('/signin/form', signinForm);
router.post('/signin', signinControl, signin);
router.get('/signout', signout);

module.exports = router;