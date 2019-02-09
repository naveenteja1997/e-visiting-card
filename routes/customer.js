var express = require('express');
var multer = require('multer');
var fileUpload = require('express-fileupload');
var bodyParser = require("body-parser");
var app = express();
var functions = require('./functions');
var mysql = require('mysql');
var crypto = require('crypto');
var session = require('express-session');
// Database Connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'naveen',
    database : 'projectinit'
  });
    
  connection.connect(function(err) {
    if (err) throw err;
    console.log("User Auth Connected!");
  });

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//File Upload Function
app.use(fileUpload());

/* GET home page. */
app.get('/', function(req, res, next) {
  if(req.session.user_id == null){
    res.redirect('../login');
  }
  res.render('customer/index', { title: 'Express' });
});
 
app.post('/addlead', function(req, res) {
  
  var data = add_lead(req,res);
  if(!req.body)
    return res.status(400).send('No Data Found');
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
});

app.get('/profile', function(req, res, next) {
   res.render('customer/profile', { title: 'Express' });
});

app.get('/leads', function(req, res, next) {
  var userid = req.session.user_id;
  if(userid == null){
    res.redirect('../login');
  }
  
  get_leads(req,res,userid, function(err, content) {
    if (err) {
    console.log(err);
    res.send(err);  
    // Do something with your error...
    } else {
    results = content;
    if(results.length>0){
    console.log(results.length);
    console.log(results);
    res.render('customer/leads',{leads : results});
    }
    }
});
});
app.get('/connections', function(req, res, next) {
  var userid = req.session.user_id;
  if(userid == null){
    res.redirect('../login');
  }
  var error = req.query.noconnections;
  if(error == 0 ){
    res.render('customer/connections',{error : error});
  }
  else{
    get_connections(req,res,userid, function(err, content) {
      if (err) {s
      console.log(err);
      res.send(err);  
      // Do something with your error...
      } else {
      results = content;
      if(results.length>0){
        var error = 1;
      res.render('customer/connections',{connections : results, error : error});
      }
      }
  }); }
});
app.get('/newlead',function(req, res, next){
  var userid = req.session.user_id;
  if(userid == null){
    res.redirect('../login');
  }
  var error = req.query.noleads;
	res.render('customer/newlead',{error : error});
});
app.get('/slugavailable', function(req,res,net){
  var slug = req.query.slug.replace(/\s+/g, '');
  // res.send(slug);
  query = "SELECT * FROM table_leads WHERE slug=?";
  parameter = [slug];
  connection.query(query,parameter,(err,results,fields) =>{
      if (err) {
          return console.error(err.message);
          }
          res.json(results.length);          
});
});
app.get('/editlead',function(req,res){
  var sessionid = req.session.user_id;
  var status = req.query.status;
  if(session== null){
    res.redirect('../login');
  }
  query = "SELECT * FROM table_leads where UserId=? AND LeadsId=?";
  parameter = [sessionid,req.query.id];
  connection.query(query,parameter, (err,results,fields) => {
      if(err){
          return console.error(err.message);
      }
    //  console.log('results length= '+results.length);
    if(results.length==0){
      res.redirect('/user/leads');
    }
  });
  edit_lead(req,res,sessionid,function(err, content) {
    if (err) {
    console.log(err);
    res.send(err);  
    // Do something with your error...
    } else {
    results = content;
    if(results.length>0){
    res.render('customer/editlead',{leads : results, id : req.query.id, status : status});
    }
    }
});
});
app.post('/editstyle', function(req,res){
  if(req.session.user_id== null){
    res.redirect('../login');
  }
  if(!req.body)
    return res.status(400).send('No Data Found');

  var editstyle = edit_style(req,res,req.session.user_id);
});
app.post('/editdetails',function(req,res){
  if(req.session.user_id==null){
    res.redirect('../login');
  }
  if(!req.body)
  return res.status(400).send('No Data Found');

  var editdetails = edit_details(req,res,req.session.user_id);
});
app.post('/addconnection',function(req,res){
  var connection = add_connection(req,res,req.session.user_id);
});

app.get('/checkconnection', function(req,res,net){

  query = "SELECT leads.LeadsId from table_leads leads, table_friends friends WHERE CONCAT(leads.UserId,leads.Slug,leads.LeadsId)=? AND friends.LeadId = leads.LeadsId AND friends.UserId = ?";
  parameter = [req.query.code,req.session.user_id];
  console.log(req.query.code,req.session.user_id);
  connection.query(query,parameter,(err,results,fields) =>{
      if (err) {
          return console.error(err.message);
          }
          res.json(results.length);          
});
});
module.exports = app;