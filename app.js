const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const fileUpload = require('express-fileupload')
const session = require('express-session')
const connectDB = require("./config/config")

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var sellerRouter = require('./routes/seller');
var consultantRouter = require('./routes/consultant');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } //max age 1 hour
}))
async function connect() {
  try {
    await connectDB();
    console.log("Connected Database")
  } catch (error) {
    console.log(error)
  }
}
connect()

hbs.registerPartials(__dirname + "/views/partials");

app.all("/*", function (req, res, next) {
  req.app.locals.layout = "layout/admin-layout";
  next();
})
app.all("/users/*", function (req, res, next) {
  req.app.locals.layout = "layout/userLayout";
  next();
})
app.all("/seller/*", function (req, res, next) {
  req.app.locals.layout = "layout/sellerLayout";
  next();
})
app.all("/consultant/*", function (req, res, next) {
  req.app.locals.layout = "layout/consultantLayout";
  next();
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.use('/', adminRouter);
app.use('/users', usersRouter);
app.use('/seller', sellerRouter)
app.use('/consultant', consultantRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

