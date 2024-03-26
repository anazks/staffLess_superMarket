const express = require('express');
const router = express.Router();

/* GET home page. */

const {
    getConsultantLoginPage,
    getConsultantSignupPage,
    doLogin,
    doSignup,
    logout,
    getConsultantHome,
    addMedBlogPage,
    addMedBlog,
    getAllMedBlogs
} = require("../controllers/consultant-controller");
const { checkConsultant } = require("../middlewares/checkConsultant")


router.get('/register', getConsultantSignupPage)
router.post('/register', doSignup)
router.get('/', getConsultantLoginPage)
router.post('/login', doLogin)
router.get('/consultantHome', checkConsultant, getConsultantHome)
router.get('/logout', logout)
router.get('/add-med-blogs', checkConsultant, addMedBlogPage)
router.post('/add-med-blogs', checkConsultant, addMedBlog)
router.get('/view-med-blogs', checkConsultant, getAllMedBlogs)





module.exports = router;