const express = require('express')
const router = express.Router()
var mysql = require("mysql");
const pdf = require("html-pdf");
const fs = require("fs");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const options = { format: "A4" };
const homeController = require('../controllers/HomeController');
const aboutController = require('../controllers/AboutUs');
const contactController = require('../controllers/ContactUs');
const usersController = require('../controllers/usersController');
var mysqlConnection = mysql.createConnection({
  host: "localhost",
  username: "root",
  password: "",
  database: "mysql",
  port: "3306",
  multipleStatements: true,
});
mysqlConnection.connect((err) => {
  if (!err) console.log("Connection Established Successfully");
  else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
});
router.get('/', homeController.get);

router.get('/home', homeController.get);
router.get('/aboutus', aboutController.get);
router.get('/contactus', contactController.get);
router.use(session({
  name: 'suid',
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000,
    sameSite: true
  }
}));
const redirectLogin = (req, res, next) => {
  if (!req.session.username) {
    res.redirect('/users/login');
  }
  else {
    next();
  }
}
function redirectHome (req, res, next){
  if (typeof req.session.username === 'undefined') {
    next();
  }
  else {
    res.redirect('/users');
  }
}
router.get('/users/login',redirectHome, function (req, res) {
  res.render('pages/Login')
});


router.post('/users/login', function (req, res) {

  // create Request object

  var username = req.body.username
  var password = req.body.password
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    mysqlConnection.query(`SELECT * FROM userreg WHERE username = '${username}' AND password = '${password}'`, function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        // Authenticate the user
        req.session.loggedin = true;
        req.session.username = username;
        // Redirect to home page
        res.redirect('/users?loggedinUser='+req.session.username);
      } else {
        res.redirect('/users/login?error=\'Incorrect Username and/or Password!\'');
      }
      res.end();
    });
  } else {
    res.send('Please enter Username and Password!');
    res.end();
  }
})
router.get('/users/logout', redirectLogin, function (req, res) {
  req.session.destroy(err => {
    if (err) {
      res.status(400).send('Unable to log out')
    } else {
      res.redirect('/users/login')
    }
  });
})
router.get('/users', redirectLogin, usersController.get);
router.get('/supervisors', function (req, res) {
  console.log(req.query.search)
  let userQuery = ""
  if (req.query.search === undefined) {
    userQuery = `SELECT COUNT(*) FROM supervisorReg`;
  }
  else {
    let name = req.query.search;
    userQuery = `SELECT COUNT(*) FROM supervisorReg where name LIKE '%${name}%'`;
  }
  mysqlConnection.query(userQuery, (err, totalSupervisors, fields) => {
    let supervisorCount = totalSupervisors[0]["COUNT(*)"];
    let page = req.query.page ? req.query.page : 1;
    let supervisorsPerPage = req.query.supervisorsPerPage ? req.query.supervisorsPerPage : 2;
    let startLimit = (page - 1) * supervisorsPerPage;
    let totalPages = Math.ceil(supervisorCount / supervisorsPerPage);

    //res.send(`${movieCount}`);
    let selectQuery = ""
    console.log(req.query.search)
    if (req.query.search === undefined) {
      selectQuery = `SELECT * FROM supervisorReg 
      LIMIT ${startLimit}, ${supervisorsPerPage}`;
    }
    else {
      let name = req.query.search;
      console.log(name)
      selectQuery = `SELECT * FROM supervisorReg where name LIKE '%${name}%' LIMIT ${startLimit}, ${supervisorsPerPage}`;
    }

    mysqlConnection.query(selectQuery, (err, supervisors, fields) => {
      if (!err) {
        console.log(supervisors)
        res.render("pages/supervisor", {
          data: supervisors,
          supervisorCount,
          page,
          totalPages,
          supervisorsPerPage,
        });
      }
      else console.log(err);
    });
  });
});

router.get('/about', function (req, res) {
  res.render('about');
})
router.get('/', function (req, res) {
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012 },
    { name: 'Tux', organization: "Linux", birth_year: 1996 },
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013 }
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";
  var myName = 'Rameez Ahmed';
  res.render('index', {
    mascots: mascots,
    tagline: tagline,
    myName: myName
  });
});
router.get('/users/insertData', function (req, res) {
  res.render('pages/insertUser')
})
router.get('/users/registerUser', function (req, res) {
  res.render('pages/registerUser')
})
router.get('/supervisors/registerSupervisor', function (req, res) {
  res.render('pages/registerSupervisor')
})

router.get('/users/updateUser', function (req, res) {

  // create Request object

  var id = req.query.id
  mysqlConnection.query(`select * from userReg WHERE  id= ${id}`, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      let jsonString = JSON.stringify(recordset)
      let JSONdata = JSON.parse(jsonString);
      data = recordset
      console.log(data)
      res.render('pages/updateUser', {
        data: data,
        id: id,
      })
    }

  });
})
router.get('/supervisors/updateSupervisor', function (req, res) {

  // create Request object

  var id = req.query.id
  mysqlConnection.query(`select * from supervisorReg WHERE  id= ${id}`, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      let jsonString = JSON.stringify(recordset)
      let JSONdata = JSON.parse(jsonString);
      data = recordset
      console.log(data)
      res.render('pages/updateSupervisor', {
        data: data,
        id: id,
      })
    }
  });
})
router.get('/users/printUsers', function (req, res) {
  {
    // request.query("SELECT COUNT(*) from userReg",(err,totalSupervisors,fields)=>{
    //   console.log(totalSupervisors);
    //   let userCount=totalSupervisors[1][""];
    //   let page=req.query.page ? req.query.page :1;
    //   var perPageUsers=req.query.usersPerPage ? req.query.usersPerPage : 3 ;
    //   let startLimit = (page-1)*usersPerPage;
    //   let totalPages=Math.ceil(userCount/usersPerPage);
    //   let selectQuery=`SELECT * from userReg limit ${startLimit}, ${perPageUsers}`; 
    //   request.query(selectQuery,(err,recordset)=>{
    //     let jsonString=JSON.stringify(recordset)
    //       let JSONdata=JSON.parse(jsonString);
    //       data=JSONdata.recordset
    //       console.log(data)
    //       res.render('pages/users',{
    //         data: data,
    //         totalPages: totalPages,
    //         startLimit: startLimit,
    //         page: page
    //       })
    //   })
    // }) 
    // query to the database and get the records
    mysqlConnection.query('select * from userReg', function (err, recordset) {

      if (err) {
        console.log(err);
      }

      // send records as a response
      else {
        let jsonString = JSON.stringify(recordset)
        let JSONdata = JSON.parse(jsonString);
        data = JSONdata.recordset
        console.log(data)
        res.render('pages/users', {
          data: data
        }, function (err, html) {
          pdf
            .create(html, options)
            .toFile("uploads/allUsers.pdf", function (err, result) {
              if (err) return console.log(err);
              else {
                var allUsersPdf = fs.readFileSync("uploads/allUsers.pdf");
                res.header("content-type", "application/pdf");
                res.send(allUsersPdf);
              }
            })
        });
      }
    });
  }
})
router.get('/api/users/printUsers', function (req, res) {
  {
    // request.query("SELECT COUNT(*) from userReg",(err,totalSupervisors,fields)=>{
    //   console.log(totalSupervisors);
    //   let userCount=totalSupervisors[1][""];
    //   let page=req.query.page ? req.query.page :1;
    //   var perPageUsers=req.query.usersPerPage ? req.query.usersPerPage : 3 ;
    //   let startLimit = (page-1)*usersPerPage;
    //   let totalPages=Math.ceil(userCount/usersPerPage);
    //   let selectQuery=`SELECT * from userReg limit ${startLimit}, ${perPageUsers}`; 
    //   request.query(selectQuery,(err,recordset)=>{
    //     let jsonString=JSON.stringify(recordset)
    //       let JSONdata=JSON.parse(jsonString);
    //       data=JSONdata.recordset
    //       console.log(data)
    //       res.render('pages/users',{
    //         data: data,
    //         totalPages: totalPages,
    //         startLimit: startLimit,
    //         page: page
    //       })
    //   })
    // }) 
    // query to the database and get the records
    mysqlConnection.query('select * from userReg', function (err, recordset) {

      if (err) {
        console.log(err);
      }

      // send records as a response
      else {
        let jsonString = JSON.stringify(recordset)
        let JSONdata = JSON.parse(jsonString);
        data = JSONdata.recordset
        console.log(data)
        res.json({
          data: data
        }).sendStatus(200)
        // res.render('pages/users',{
        //   data: data
        // },function(err,html){
        //   pdf
        //   .create(html,options)
        //   .toFile("uploads/allUsers.pdf",function(err,result){
        //     if(err) return console.log(err);
        //     else{
        //       var allUsersPdf=fs.readFileSync("uploads/allUsers.pdf");
        //       res.header("content-type", "application/pdf");
        //       res.send(allUsersPdf);
        //     }
        //   })
        // })
      }

    });
  }
})
router.post('/users/delete', function (req, res) {
  var id = req.body.id
  console.log(id);
  var Query = `DELETE FROM userReg WHERE id=${id}`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.redirect('/users');
    }

  });
})
router.post('/supervisors/delete', function (req, res) {
  var id = req.body.id
  console.log(id);
  var Query = `DELETE FROM supervisorReg WHERE id=${id}`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.redirect('/supervisors');
    }

  });
})
router.post('/api/users/delete', function (req, res) {
  var id = req.body.id
  console.log(id);
  var Query = `DELETE FROM userReg WHERE id=${id}`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.json({
        recordset: recordset
      }).sendStatus(201);
    }

  });
})
router.post('/users/registerUser', function (req, res) {

  // create Request object

  var fname = req.body.fname
  var lname = req.body.lname
  var birthday = req.body.birthday
  var username = req.body.username
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var password = req.body.password
  var Query = `INSERT INTO userReg (fname,lname,birthday,username,email,phone,country,password) VALUES('${fname}','${lname}','${birthday}','${username}','${email}','${phone}','${country}','${password}')`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.redirect('/users');
    }

  });
})
router.post('/supervisors/registerSupervisor', function (req, res) {

  // create Request object

  var name = req.body.name
  var dob = req.body.dob
  var gender = req.body.gender
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var department = req.body.department
  var experties = req.body.experties
  var groups = req.body.groups
  var password = req.body.password
  var profilePic = req.body.profilePic
  var Query = `INSERT INTO supervisorReg (name,dob,gender,email,phone,country,department,experties,groups,password,profilePic) VALUES('${name}','${dob}','${gender}','${email}','${phone}','${country}','${department}','${experties}',${groups},'${password}','${profilePic}')`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.redirect('/supervisors');
    }

  });
})
router.post('/api/users/registerUser', function (req, res) {

  // create Request object

  var fname = req.body.fname
  var lname = req.body.lname
  var birthday = req.body.birthday
  var username = req.body.username
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var password = req.body.password
  var profilePic = req.body.profilePic

  // query to the database and insert the records

  var Query = `INSERT INTO userReg (fname,lname,birthday,username,email,phone,country,password,profilePic) VALUES('${fname}','${lname}','${birthday}','${username}','${email}','${phone}','${country}','${password}','${profilePic}')`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.json({
        recordset: recordset
      }).sendStatus(201);
    }

  });
})
router.post('/users/updateUser', function (req, res) {

  // create Request object
  var id = req.body.id
  var fname = req.body.fname
  var lname = req.body.lname
  var birthday = req.body.birthday
  var username = req.body.username
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var password = req.body.password
  var oldpassword = req.body.oldpassword
  var profilePic = req.body.profilePic
  mysqlConnection.query(`select (password) from userReg where id=${id}`, function (err, recordset) {
    if (err) {
      console.log(err);
    }
    else {
      data = recordset
      console.log(data)
      if (data[0].password == oldpassword) {
        var Query = `UPDATE userReg SET fname = '${fname}', lname='${lname}', birthday='${birthday}', username='${username}', email='${email}', phone='${phone}', country='${country}',password='${password}', profilePic='${profilePic}' WHERE id=${id}`
        request.query(Query, function (err, recordset) {

          if (err) {
            console.log(err);
          }

          // send records as a response
          else {
            res.redirect('/users');
          }

        });
      }
      else {
        var error = "Invalid Old Password"
        res.render("/users/updateUser?id=" + id, {
          error: error
        })
      }
    }
  })
})
router.post('/supervisors/updateSupervisor', function (req, res) {

  // create Request object
  var id = req.body.id
  var name = req.body.name
  var dob = req.body.dob
  var gender = req.body.gender
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var department = req.body.department
  var experties = req.body.experties
  var groups = req.body.groups
  var password = req.body.password
  var profilePic = req.body.profilePic
  var oldpassword = req.body.oldpassword
  mysqlConnection.query(`select (password) from supervisorReg where id=${id}`, function (err, recordset) {
    if (err) {
      console.log(err);
    }
    else {
      data = recordset

      console.log(data[0].password)
      if (oldpassword === undefined) {
        var error = "Invalid Old Password"
        res.render("/supervisors/updateSupervisor?id=" + id, {
          error: error
        })
      }
      else {
        if (data[0].password == oldpassword) {
          var Query = `UPDATE supervisorReg SET name = '${name}', dob='${dob}', gender='${gender}', email='${email}', phone='${phone}', country='${country}', department='${department}',experties='${experties}',groups='${groups}',password='${password}', profilePic='${profilePic}' WHERE id=${id}`
          mysqlConnection.query(Query, function (err, recordset) {

            if (err) {
              console.log(err);
            }

            // send records as a response
            else {
              res.redirect('/supervisors');
            }

          });
        }
        else {
          var error = "Invalid Old Password"
          res.render("/supervisors/updateSupervisor?id=" + id, {
            error: error
          })
        }
      }
    }
  })
})
router.post('/api/users/updateUser', function (req, res) {

  // create Request object
  var id = req.body.id
  var fname = req.body.fname
  var lname = req.body.lname
  var birthday = req.body.birthday
  var username = req.body.username
  var email = req.body.email
  var phone = req.body.phone
  var country = req.body.country
  var password = req.body.password
  var oldpassword = req.body.oldpassword

  // query to the database and insert the records
  // (fname,lname,birthday,username,email,phone,country,password)
  mysqlConnection.query(`select (password) from userReg where id=${id}`, function (err, recordset) {
    if (err) {
      console.log(err);
    }
    else {
      let jsonString = JSON.stringify(recordset)
      let JSONdata = JSON.parse(jsonString);
      data = JSONdata.recordset
      console.log(data)
      if (data[0].password == oldpassword) {
        var Query = `UPDATE userReg SET fname = '${fname}', lname='${lname}', birthday='${birthday}', username='${username}', email='${email}', phone='${phone}', country='${country}',password='${password}' WHERE id=${id}`
        request.query(Query, function (err, recordset) {

          if (err) {
            console.log(err);
          }

          // send records as a response
          else {
            res.status(201).json({
              recordset: recordset
            });
          }

        });
      }
      else {
        var error = "Invalid Old Password"
        res.render("/users/updateUser?id=" + id, {
          error: error
        })
      }
    }
  })

});
router.post('/users/insertData', function (req, res) {

  // create Request object

  var name = req.body.playerName
  var Age = req.body.Age
  var profile = req.body.profilePic
  var info = req.body.info
  console.log(name);
  console.log(Age);
  console.log(profile);
  console.log(info);
  var Query = `INSERT INTO express (playerName,Age,profilePic,info) VALUES('${name}',${Age},'${profile}','${info}')`
  mysqlConnection.query(Query, function (err, recordset) {

    if (err) {
      console.log(err);
    }

    // send records as a response
    else {
      res.redirect('/users');
    }

  });
});
module.exports = router