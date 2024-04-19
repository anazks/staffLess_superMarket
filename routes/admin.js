const express = require('express');
const router = express.Router();
const { checkAdmin } = require("../middlewares/checkAdmin")
const { checkAdminExist } = require("../middlewares/checkAdminExist")
const vonage = require('../sms/sms')
const {
  getMainHomePage,
  getLoginPage,
  doLogin,
  logout,
  getHomePage,
  getAllSellers,
  getAllUsers,
  blockSeller,
  deleteProduct,
  getAllConsultants,
  getAllApprovedProducts,
  getAllMedBlogs,
  rejectProduct,
  approveProduct,
  approveMedBlog,
  rejectMedBlog,
  deleteMedBlog,
  blockMedConsultant,
  blockUser
} = require("../controllers/admin-controller")


/* GET home page. */
router.get('/', checkAdminExist, getMainHomePage)
router.get('/login', getLoginPage)
router.post('/login', doLogin)
router.get('/logout', checkAdmin, logout)
router.get('/home', checkAdmin, getHomePage);

router.get('/sellers-list', checkAdmin, getAllSellers)
router.get('/user-list', checkAdmin, getAllUsers)
router.get('/product-list', checkAdmin, getAllApprovedProducts)
router.get('/med-blog-list', checkAdmin, getAllMedBlogs)
router.get('/consultant-list', checkAdmin, getAllConsultants)

router.get("/approve-product/:id", checkAdmin, approveProduct)
router.get("/reject-product/:id", checkAdmin, rejectProduct)
router.get('/delete-product/:id', checkAdmin, deleteProduct)
router.get("/approve-med-blog/:id", checkAdmin, approveMedBlog)
router.get("/reject-med-blog/:id", checkAdmin, rejectMedBlog)
router.get('/delete-med-blog/:id', checkAdmin, deleteMedBlog)

router.get("/block-seller/:id", checkAdmin, blockSeller)
router.get("/block-med-consultant/:id", checkAdmin, blockMedConsultant)
router.get("/block-user/:id", checkAdmin, blockUser)


router.post('/sentSMS',(req,res)=>{
  try {
        const from = "Vonage APIs"
        const to = "917510491315"
        const text = 'Alert!!! from flood monitoring system!'
        
        async function sendSMS() {
            await vonage.sms.send({to, from, text})
                .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
        }
    
    sendSMS();
  } catch (error) {
      console.log(error)
  }
})

router.post('/getSMS',(req,res)=>{
  try {
        const from = "Vonage APIs"
        const to = "917510491315"
        const text = 'Alert!!! from flood monitoring system!'
        
        async function sendSMS() {
            await vonage.sms.send({to, from, text})
                .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
        }
    
    sendSMS();
  } catch (error) {
      console.log(error)
  }
})

module.exports = router;

