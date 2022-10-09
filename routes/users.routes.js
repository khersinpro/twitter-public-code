const router = require("express").Router();
const {
    signupForm,
    signup,
    uploadImage,
    userProfile,
    userList,
    followUser,
    unfollowUser,
    emailLinkVerification,
    initResetPassword,
    resetPasswordForm,
    resetPassword
} = require("../controllers/users.controller");
const upload = require('../middleware/multer');
const { signupControl } =  require('../middleware/input-validate');
const { ensureAuthenticated } = require("../config/guards.config");

router.get("/email-verification/:userId/:token", emailLinkVerification);
router.get("/follow/:userId", followUser);
router.get("/unfollow/:userId", unfollowUser);
router.get("/", userList);
router.get("/:username", userProfile);
router.get("/signup/form", signupForm);
router.post("/singup", signupControl, signup);
router.post("/update/image", ensureAuthenticated, upload.single('avatar'), uploadImage);
router.post("/forgot-password", initResetPassword);
router.get("/reset-password/:userId/:token", resetPasswordForm)
router.post("/reset-password/:userId/:token", resetPassword)

module.exports = router;
