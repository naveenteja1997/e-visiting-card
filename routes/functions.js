var mysql = require('mysql');
var crypto = require('crypto');
var fileUpload = require('express-fileupload');
var moment = require('moment');
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
get_timestamp = function(req,res){
    
    // Setting TimeStamp
    var currentDate = new Date();
    var date = currentDate.getDate();
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    var minute = currentDate.getMinutes();
    var hour = currentDate.getHours();
    var second = currentDate.getSeconds();

    var TimeStamp = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    return TimeStamp;
}
add_lead = function(req,res){
    console.log(req.body);
    var fullname = req.body.fullname;
    var companyname = req.body.companyname;
    var designation = req.body.designation;
    var emailid = req.body.emailid;
    var phonenumber = req.body.phonenumbercode + req.body.phonenumber;
    var whatsappnumber = req.body.whatsappcode + req.body.whatsappnumber;
    var slug = req.body.slug;
    var address = req.body.address;
    var skypeid = req.body.skypeid;
    var facebook = req.body.facebookid;
    var aboutcompany = req.body.aboutcompany;
    var website =  req.body.website;
    var twitter = req.body.twitter;
    var linkedin = req.body.linkedin;
    var userid = req.session.user_id;
    var style = req.body.style;
    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    var statement = `INSERT INTO table_leads(UserId,slug,style, Name, Designation, PhoneNumber, EmailId, Whatsapp, Skype,Facebook, CompanyName, AboutCompany, Website, LinkedIn, Twitter,address,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var parameters = [userid,slug,style,fullname,designation,phonenumber,emailid,whatsappnumber,skypeid,facebook,companyname,aboutcompany,website,linkedin,twitter,address,timestamp];
    connection.query(statement,parameters,(err, results, fields) => {
        if(err){
            return console.error(err.message);
    }
    else{
        var inserted_id = results.insertId;
        console.log('Last Lead Inserted ID : ' + inserted_id);
        let companylogo = req.files.companylogo;
        let profilepicture = req.files.profilepicture;
         // Use the mv() method to place the file somewhere on your server
         companylogo.mv('public/companylogo/'+inserted_id+'.jpg', function(err) {
           if (err)
             return res.status(500).send(err);
         });
            profilepicture.mv('public/profilepicture/'+inserted_id+'.jpg', function(err) {
            if (err)
              return res.status(500).send(err);
          });
          var status = true; 
          res.redirect('/user/leads?added='+status+'.jpg');
    }
    });
}
get_leads = function(req, res,data,callback){
    query = "SELECT * FROM table_leads where UserId=?";
    parameter = [data];
    connection.query(query,parameter, (err,results,fields) => {
        if(err){
            return console.error(err.message);
        }
        if(results.length>0){
            callback(null, results);
        }
        else{
            res.redirect('newlead?noleads=0');
        }
    });
}
edit_lead = function(req,res,sessionid,callback){
   console.log(sessionid);
    query="SELECT * FROM table_leads WHERE UserId=? AND LeadsId=?";
    parameter =[sessionid,req.query.id];

    connection.query(query,parameter, (err,results,fields)=>{
        if(err){
            console.error(err.message);
        }
        if(results.length>0){
            callback(null, results);
        }
    });
}

edit_style = function(req,res,sessionid){
    console.log(req.query.id);
    query = "UPDATE table_leads SET style = ? WHERE LeadsId = ? AND UserId = ?";
    parameter = [req.body.style, req.query.id,sessionid];
    console.log('Here');
    connection.query(query,parameter, (err,results,fields) => {
        if(err){
            console.error(err.message);
        }
        if(results.affectedRows>0){
            console.log('Data Updated');
            res.redirect('/user/editlead?id='+req.query.id+'&status=0');
        }
        else{
            return 1;
        }
    });
    console.log('done');
}
edit_details = function(req,res,sessionid){

    query="UPDATE table_leads SET Name=? , CompanyName=?, Designation=?, EmailId=?, address=?, AboutCompany=?, Facebook=?, Skype=?, LinkedIn =?, Twitter=?  WHERE LeadsId = ? AND UserId = ? ";
    parameter = [req.body.fullname,req.body.companyname,req.body.designation,req.body.emailid,req.body.address,req.body.aboutcompany,req.body.facebookid,req.body.skypeid,req.body.linkedin,req.body.twitter, req.query.id,sessionid];

    connection.query(query,parameter, (err,results,fields) => {
        if(err)
        console.error(err.message);
        
        if(results.affectedRows>0){
            console.log('Data Updated');
            res.redirect('/user/editlead?id='+req.query.id+'&status=0');
        }
        else{
            return 1;
        }

    });
}
get_connections = function(req,res,sessionid,callback){

    query = "SELECT * FROM table_friends friends, table_leads leads Where friends.UserId = ? AND friends.UserId=leads.UserId";
    parameter=[sessionid];

    connection.query(query,parameter,(err,results,fields) => {
        if(err)
        console.error(err.message);
        if(results.length>0){
            callback(null, results);
        }
        else{
            res.redirect('connections?noconnections=0');
        }       
    });
}
add_connection = function(req,res,sessionid){
    var leadid = req.body.code;
    
    query = "SELECT LeadsId from table_leads WHERE CONCAT(UserId,Slug,LeadsId)=?";
    parameter = [leadid];
     connection.query(query,parameter, (err,results,field) => {
         console.log('inside connection1');
        if(err)
        console.error(err.message);

        console.log(results.length);
        if(results.length>0){   
                console.log('Connection Found');
                query = "INSERT INTO table_friends (UserId,LeadId) VALUE(?,?)";
                parameter = [sessionid,results.LeadsId];
                connection.query(query,parameter, (err,results,fields) =>{
                    if(err)
                    console.error(err.message);
                    else{
                        console.log('Last Inserted ID : ' + results.insertId);
                        res.redirect('/user/connections?connection=added');
                        }
                });
        }
     });
}