const UserModel = require("../models/user-model");
const ProductModel = require('../models/product-model')
const medBlogModel = require("../models/medicinal-blog-model");
const CartModel = require('../models/cart-model');
const OrderModel = require('../models/order-model');
const bcrypt = require("bcrypt");
const productModel = require("../models/product-model");

const getUserHomePage = async function (req, res, next) {
    try {
        let products = await ProductModel.find({ status: "approved" }).limit(8);
        let medBlogs = await medBlogModel.find({ status: "approved" }).sort({ date: 1 }).limit(4)
        let { user } = req.session;
        let CartTotal = 0;
        res.render('user/home', { product: products, user, CartTotal, medBlogs });
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Error Occured. Please Retry !!!";
        res.redirect("/users/login")
    }
}

const getUserLoginPage = function (req, res, next) {
    res.render("user/userLogin", { homepage: true })
}
const getUserSignupPage = function (req, res, next) {
    res.render("user/userReg", { homepage: true })
}

const doLogin = async (req, res) => {
    console.log(req.body);
    try {
        console.log(req.body, req.body.password);
        let { password } = req.body;
        const user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            const exist = await bcrypt.compare(password, user.password);
            
            if (exist) {
                req.session.user = user;
                return res.redirect("/users/home");
            }else{
                return res.redirect("/users/home");
            }
        }
        req.session.alertMessage = "Invalid user Credentials";
        res.redirect("/users/login");
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Error Occured. Please Retry !!!";
        res.redirect("/users/login")
    }
}
const doSignup = async (req, res) => {
    console.log(req.body);
    try {
        console.log(req.body, req.body.password);
        let { password } = req.body;
        req.body.password = await bcrypt.hash(password, 10)
        const user = await UserModel.create(req.body);
        res.redirect('/users/login')
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/users/signup")
    }
}
const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/')
}
const getAllMedBlogs = async (req, res) => {
    try {
        let { user } = req.session;
        let medBlogs = await medBlogModel.find({ status: "approved" }).sort({ date: 1 })
        res.render("user/blogsList", { user, medBlogs })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/users/signup")
    }
}
const getAllProducts = async (req, res) => {
    try {
        let { user } = req.session;
        let products = await ProductModel.find({ status: "approved" })
        res.render("user/productList", { user, products })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/users/login")
    }
}

const addToCart = async (req, res) => {
    //check if cart exist 
    let { user } = req.session;
    let { id } = req.params;
    try {
        let product = await ProductModel.findOne({ _id: id });
        product.id = id;
        let obj = {
            item: product,
            quantity: 1
        }
        let cart = await CartModel.findOne({ userId: user._id })
        if (cart) {
            console.log("cart already exist");
            let proExist = cart.products.findIndex(product => product.item._id == id)
            console.log(proExist);
            if (proExist != -1) {
                await CartModel.findOneAndUpdate({
                    "products.item._id": product._id
                },
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }
                )
                res.redirect("/users/cart")
            } else {
                await CartModel.findOneAndUpdate({ userId: user._id },
                    {
                        $push: {
                            products: obj
                        }
                    }
                )
                res.redirect("/users/cart")
            }
        } else {
            let cartObj = {
                userId: user._id,
                products: [obj]
            }
            console.log("cart", cartObj)
            await CartModel.create(cartObj);
            res.redirect("/users/cart")
        }
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform operation Please Retry!!!";
        res.redirect("/users/home")
    }
}
const getCartProducts = async (req, res) => {
    try {
        let { user } = req.session
        let { _id } = req.session.user
        let myCart = await CartModel.findOne({ userId: _id })
        if (myCart) {
            console.log(myCart.products)
            let total = 0;
            let totalMRP = 0
            for (let p of myCart.products) {
                total += (parseInt(p.item.price) * parseInt(p.quantity))
                totalMRP += (parseInt(p.item.mrp) * parseInt(p.quantity))
            }
            let saved = totalMRP - total;
            res.render("user/cart", { products: myCart.products, user, total, totalMRP, saved })
        } else
            res.render("user/cart", { products: false, user, })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry!!!";
        res.redirect("/users/home")
    }
}
const removeCartProduct = async (req, res) => {
    try {
        let { _id } = req.session.user;
        let { id } = req.params
        await CartModel.findOneAndUpdate({ userId: _id },
            {
                $pull: {
                    products: {
                        'item._id': id
                    }
                }
            }
        )
        res.redirect("/users/cart")
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry!!!";
        res.redirect("/users/home")
    }
}

const goToPayment = async (req, res) => {
    try {
        let { id, qty } = req.params;
        let { _id, userName, email, mobile } = req.session.user
        let product = await ProductModel.findOne({ _id: id })
        let orderObj = {
            productId: product._id,
            productName: product.productName,
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            buyerId: _id,
            buyerName: userName,
            buyerPhone: mobile,
            buyerEmail: email,
            date: new Date().toLocaleDateString(),
            quantity: qty,
            totalPrice: parseFloat(product.price) * parseFloat(qty),
            status: "pending"
        }
        let order = await OrderModel.create(orderObj)
        console.log(order._id)
        res.render('user/payment', { homepage: true, total: orderObj.totalPrice, orderId: order._id })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry!!!";
        res.redirect("/users/home")
    }
}

const confirmPayment = async (req, res) => {
    try {
        let { orderId } = req.body
        let order = await OrderModel.findOneAndUpdate({ _id: orderId }, {
            $set: { status: "Order Placed" }
        })
        await CartModel.findOneAndUpdate({ userId: req.session.user._id }, { $set: { products: [] } })
        res.redirect("/users/home")
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform request Please Retry!!!";
        res.redirect("/users/home")
    }
}

const getMyOrders = async (req, res) => {
    try {
        let { user } = req.session;
        let orders = await OrderModel.find({ buyerId: user._id })
        res.render('user/myorders', { product: orders, user, homepage: true })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform request Please Retry!!!";
        res.redirect("/users/home")
    }
}

const addLike = async (req, res) => {
    try {
        let { user } = req.session
        let { id } = req.params;
        let blog = await medBlogModel.findOne({ _id: id });
        if (blog.likes.length != 0) {
            let likedAlready = blog.likes.findIndex(singleUser => singleUser == user._id)
            if (likedAlready <= -1) {
                await medBlogModel.findOneAndUpdate({ _id: id },
                    {
                        $push: {
                            likes: user._id
                        }
                    })
                res.redirect("/users/all-med-blogs")
            } else {
                res.redirect("/users/all-med-blogs")
            }
        } else {
            console.log("no likes here");
            await medBlogModel.findOneAndUpdate({ _id: id },
                {
                    $push: {
                        likes: user._id
                    }
                })
            res.redirect("/users/all-med-blogs")
        }
    } catch (error) {

    }
}

const searchProduct = async (req, res) => {
    try {
        let { search } = req.body;
        let { user } = req.session
        let products = await ProductModel.find({ productName: { $regex: search }, status: "approved" })
        res.render("user/productList", { user, products })
    } catch (error) {
        console.log(error);
        req.session.alertMessage = "Couldn't perform signup Please Retry (with a new email) !!!";
        res.redirect("/users/home")
    }
}
const readQR = (req,res)=>{
    try {
        res.render('user/ReacQR')
    } catch (error) {
        console.log(error)
    }
}
const getItems = async (req,res)=>{
    try {
        let {id} = req.body;
        let product =  await productModel.find({_id:id})
        console.log(product,"-----product")
        res.render('user/pay_product',{product})
    } catch (error) {
        
    }
}
module.exports = {
    getUserHomePage,
    getUserLoginPage,
    getUserSignupPage,
    doLogin,
    doSignup,
    logout,
    getAllProducts,
    getAllMedBlogs,
    addToCart,
    getCartProducts,
    removeCartProduct,
    goToPayment,
    confirmPayment,
    getMyOrders,
    addLike,
    searchProduct,
    readQR,
    getItems
}