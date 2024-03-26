const SellerModel = require('../models/seller-model')
const ProductModel = require('../models/product-model')
const OrderModel = require('../models/order-model');

const bcrypt = require("bcrypt")


const getSellerHomePage = async (req, res) => {
    //fetch all products and seller details 
    try {
        let { seller } = req.session;
        let products = await ProductModel.find({ sellerId: seller._id });
        res.render('seller/sellerHome', { products, seller });
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Error Occured. Please Retry !!!";
        res.redirect("/seller")
    }

}

const getSellerSignupPage = function (req, res, next) {
    res.render('seller/sellerRegister', { homepage: true })
}
const doSignup = async (req, res) => {
    console.log(req.body);
    try {
        console.log(req.body, req.body.password);
        let { password } = req.body;
        req.body.password = await bcrypt.hash(password, 10)
        const seller = await SellerModel.create(req.body);
        res.redirect('/seller')
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/seller/register")
    }

}

const getSellerLoginPage = (req, res) => {
    let { seller } = req.session;
    if (seller)
        res.redirect("/seller/sellerHome")
    else
        res.render('seller/sellerLogin', { homepage: true })
}
const doLogin = async (req, res) => {
    try {
        console.log(req.body, req.body.password);
        let { password } = req.body;
        const seller = await SellerModel.findOne({ email: req.body.email, status: "approved" });
        if (seller) {
            const exist = await bcrypt.compare(password, seller.password);
            if (exist) {
                req.session.seller = seller;
                return res.redirect("/seller/sellerHome");
            }
        } else {
            req.session.alertMessage = "Invalid seller Credentials";
            res.redirect("/seller/login");
        }
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Error Occured. Please Retry !!!";
        res.redirect("/seller/login")
    }
}
const logout = (req, res) => {
    req.session.seller = false;
    res.redirect('/')
}

const getAddProductPage = (req, res) => {
    res.render('seller/addProduct', { homepage: true })
}
const addNewProduct = async function (req, res) {
    try {
        let { userName, _id } = req.session.seller;
        req.body.sellerId = _id;
        req.body.sellerName = userName;

        let product = await ProductModel.create(req.body);

        let { image, qr } = req.files;

        // Move image and qr files asynchronously
        const moveImage = new Promise((resolve, reject) => {
            image.mv('./public/images/product/' + product._id + ".jpg", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const moveQR = new Promise((resolve, reject) => {
            qr.mv('./public/images/qr/' + product._id + '.png', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await Promise.all([moveImage, moveQR]); // Wait for both files to be moved

        req.session.alertMessage = "Successfully added new product";
        res.redirect('/seller/sellerHome');
    } catch (error) {
        console.error(error);
        req.session.alertMessage = "Error occurred. Please retry!";
        res.redirect("/seller");
    }
}



const getSellerOrders = async (req, res) => {
    try {
        let { seller } = req.session;
        let orders = await OrderModel.find({ sellerId: seller._id})
        res.render('seller/orders', { title: "All Orders", orders, seller, homepage: true, completed: "completed orders" })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform request Please Retry!!!";
        res.redirect("/seller")
    }
}
const getShippedOrders = async (req, res) => {
    try {
        let { seller } = req.session;
        let orders = await OrderModel.find({ sellerId: seller._id, status: "order shipped" })
        res.render('seller/orders', { title: "Shipped Orders", orders, seller, homepage: true })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform request Please Retry!!!";
        res.redirect("/seller")
    }
}

const shipOrder = async (req, res) => {
    try {
        let { id } = req.params
        let order = await OrderModel.findOneAndUpdate({ _id: id }, {
            $set: { status: "order shipped" }
        })
        res.redirect("/seller/orders")
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform request Please Retry!!!";
        res.redirect("/seller")
    }
}

const getApprovedProducts = async (req, res) => {
    try {
        let { seller } = req.session;
        let products = await ProductModel.find({ sellerId: seller._id, status: "approved" })
        res.render("seller/productList", { title: "Approved products", seller, products })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/seller")
    }
}
const getRejectedProducts = async (req, res) => {
    try {
        let { seller } = req.session;
        let products = await ProductModel.find({ status: "rejected" })
        res.render("seller/productList", { title: "Rejected products", seller, products })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/seller")
    }
}

module.exports = {
    getSellerLoginPage,
    getSellerSignupPage,
    doLogin,
    doSignup,
    logout,
    getSellerHomePage,
    getAddProductPage,
    addNewProduct,
    getSellerOrders,
    shipOrder,
    getShippedOrders,
    getApprovedProducts,
    getRejectedProducts
}