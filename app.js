var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var loginauth = require('./authentication');
var session = require('express-session');

var app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
}));
// body-parser Elements
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });


var jquery =require("jquery");

var indexRouter = require('./routes/index');
var customerRouter = require('./routes/customer');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', customerRouter);

// ======== Login Page ===========
app.get('/login', function(req, res, next){
  sess=req.session;
  if(sess.user_id != null ){
    res.redirect('/user');
  }
  res.render('login');
  console.log('status='+req.query.status);
})
app.get('/logout',function(req,res,next){
  req.session.destroy();
  res.redirect('login');
})

app.post('/login',function(req,res){
  var username = login(req,res);
})
app.post('/register',function(req,res){
  var registeration = register(req,res);  
  })
// ======== End Of Login Page ===========
// ======== Login Page ===========
app.get('/register',function(req, res, next){
  sess=req.session;
  if(sess.user_id != null ){
    res.redirect('/user');
  }
  res.render('register');
})
// ======== End Of Login Page ===========

// app.use(xpressLayouts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
