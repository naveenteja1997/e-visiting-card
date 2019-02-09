var mysql = require('mysql');
var crypto = require('crypto');
// Database Connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'naveen',
    database : 'projectinit'
  });
    
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Authentication Connected!");
  });

//Login Function
login = function(req,res){
    if(!req.body)
    return res.status(400).send('No Data Found');

    var username = req.body.username;
    var password = req.body.password;
    sess=req.session;
    //Crypto Hasing using SHA-256 and BASE-64
    let crypto;
    try {
    crypto = require('crypto');
    } catch (err) {
    console.log('crypto support is disabled!');
    }
    
    var hashed_password = crypto.createHash('sha256').update(password).digest('base64');
     //End of Hashing

    let query = "SELECT * FROM table_user where EmailId=? AND Password=? ";
    let parameter = [username,hashed_password];

    // execute the insert statment
    connection.query(query, parameter, (err, results, fields) => {
    if (err) {
    return console.error(err.message);
    }
    if(results.length>0){
      // res.json(results);
    req.session.user_id = results[0].UserId;
  
    console.log(results);
    console.log('Login Page - requested user id : '+req.session.user_id);
    var authentication = true;
    res.redirect('/user?authentication='+authentication);
    }
    else{
      var authentication = false;
      res.redirect('login?authentication='+authentication);
    }
    });

    return username;
}
//Register Function
register = function(req,res){
    if(!req.body)
    return res.status(400).send('No Data Found');

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var emailid = req.body.emailid;
    var password = req.body.password;
    sess=req.session;

    //Crypto Hasing using SHA-256 and BASE-64
    let crypto;
    try {
    crypto = require('crypto');
    } catch (err) {
    console.log('crypto support is disabled!');
    }
    var hashed_password = crypto.createHash('sha256').update(password).digest('base64');
     //End of Hashing

    let query = `INSERT INTO table_user(EmailId, Password, FirstName, LastName) VALUES (?,?,?,?)`;
    let parameter = [emailid,hashed_password,firstname,lastname];

    // execute the insert statment
    connection.query(query, parameter, (err, results, fields) => {
    if (err) {
    return console.error(err.message);
    }
    else{
    // get inserted id
    var inserted_id = results.insertId;
    sess.user_id = inserted_id;
    console.log('Last Inserted ID : ' + inserted_id);
    console.log('requested user id : '+req.session.user_id);
    res.redirect('/user?accountcreated='+inserted_id);
    }
    });
    }
