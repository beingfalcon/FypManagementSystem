const express = require('express')
const router = express.Router()
var mysql = require("mysql");
const util = require("util");
const pdf = require("html-pdf");
const path = require('path');
const fs = require("fs");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const nodemailer = require("nodemailer");
const { body, validator } = require("express-validator");
// const mysqlSession = require("express-mysql-session")(session);
const options = { format: "A4" };
const homeController = require('../controllers/HomeController');
const aboutController = require('../controllers/AboutUs');
const contactController = require('../controllers/ContactUs');
const usersController = require('../controllers/usersController');
const { render } = require('ejs');
const db = require("../models");
// const { sequelize } = require('../models');
const userComments = db.userComments;
const Users = db.Users;
const userReviews = db.userReviews
const commentsReply = db.commentsReply
const session = db.session;
const sequelize = db.sequelize
const SequelizeStore = db.SequelizeStore;
const sessiontble = db.sessiontble;
const Supervisors = db.Supervisors;
const supervisorReview=db.supervisorReview
const supervisorComment=db.supervisorComment
const supervisorCommentReply=db.supervisorCommentsReply
var myStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 5 * 60 * 1000
});
router.use(
  session({
    name: 'sid',
    secret: 'secret',
    resave: false,
    store: myStore,
    saveUninitialized: true,
    cookie: {
      sameSite: true
    }
  })
)
myStore.sync();

router.post('/sent', (req, res) => {
  //Gets the inputs from the web client
  const {
    id,
    officialPosition,
    officialFullName,
    candidateEmail,
    candidateName,
  } = req.body;
  const mailOptions = {
    from: 'rameezahmednode@gmail.com',
    to: candidateEmail,
    subject: `Email for meeting with ${officialPosition}: ${officialFullName}`,
    text: "This is my First Email using NodeJS",
    html: `<p><b>Dear ${candidateName} </b></p>
          <p>You are requested to meet ${officialPosition}: ${officialFullName}</p>
    `,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("Email Sent: " + info.response);
      res.redirect(`/user?id=${id}`);
    }
  });
});
router.get("/UsersORM", async (req, res) => {
  const listOfUsers = await Users.findAll({ raw: true });
  res.json(listOfUsers);
});
// router.get('/userResult', async function(req,res){
//   let data= await fetch('https://fypmanagementsystemheroku.herokuapp.com/UsersORM');
//   res.json(data)
// });
// router.get("/user/:postId", async (req, res) => {
//   const postId = req.params.postId;
//   const comments = await Comments.findAll({ where: { PostId: postId } });
//   res.json(comments);
// });
// router.post("/user/comment", async (req, res) => {
//   const comment = req.body;
//   await userComments.create(comment);
//   res.json(comment);
// });
// var mysqlConnection = mysql.createConnection({
//   host: "db4free.net",
//   username: "f180323",
//   password: "123456789",
//   database: "f180323",
//   multipleStatements: true,
// });
// mysqlConnection.connect((err) => {
//   if (!err) console.log("Connection Established Successfully");
//   else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
// });
// var sessionStore = new mysqlSession({
//   expiration: 60 * 5 * 1000,
//   createDatabaseTable: true,
//   schema: {
//     tableName: 'sessiontble',
//     columnNames: {
//       session_id: 'session_id',
//       expires: 'expires',
//       data: 'data'
//     }
//   }
// }, mysqlConnection)
// router.use(session({
//   name: 'suid',
//   secret: 'secret',
//   resave: false,
//   store: sessionStore,
//   saveUninitialized: true,
//   cookie: {
//     sameSite: true
//   }
// }));

const redirectLogin = (req, res, next) => {
  if (!req.session.username) {
    res.redirect('/users/login');
  }
  else {
    next();
  }
}
function redirectHome(req, res, next) {
  if (typeof req.session.username === 'undefined') {
    next();
  }
  else {
    res.redirect('/users');
  }
}
const redirectInvalidLogin = (req, res, next) => {
  if (req.session.role === "user" || typeof req.session.role === 'undefined') {
    res.redirect('/users')
  }
  else {
    next();
  }
}
const redirectUnVerifiedUser = (req, res, next) => {
  if (!req.session.isVerified) {
    res.redirect("/users/login/verify");
  }
  else {
    next();
  }
}
const redirectVerifiedUser = (req, res, next) => {
  if (req.session.isVerified) {
    res.redirect("/");
  }
  else {
    next();
  }
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",

  auth: {
    user: "rameezahmednode@gmail.com",
    pass: "rlqzgontwfwfxsuw"
  }
});
const mailOptions = {
  from: 'rameezahmednode@gmail.com',
  to: "rameez98ahmed@gmail.com",
  subject: "Hello Message",
  text: "This is my First Email using NodeJS",
  html: "<b>This is my First Email using NodeJS</b>",
};
router.get("/get_users", async function (req, res) {
  let allUsers = await Users.findAll({
    raw: true,
    attributes: ['username']
  });
  res.send(JSON.stringify(allUsers));
});
router.get("/users/chat", [redirectLogin], function (req, res) {
  let username = req.session.username;
  res.render('chat', {
    username: username
  });
});
router.get("/users/sendMail", function (req, res) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("Email Sent: " + info.response);
      res.redirect("/users");
    }
  });
});
router.get('/users/login', redirectHome, function (req, res) {
  res.render('pages/Login')
});
router.post('/users/login', redirectHome, async function (req, res) {

  // create Request object

  var username = req.body.username
  var password = req.body.password


  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    results = await Users.findAll({ raw: true, where: { username: username, password: password } })
    console.log(results);
    if (results.length > 0) {
      // Authenticate the user
      req.session.loggedin = true;
      req.session.id = results[0]
      req.session.username = username;
      req.session.role = results[0].role;
      req.session.isVerified = results[0].isVerified;
      // Redirect to home page
      res.redirect('/users?loggedinUser=' + req.session.username);
    } else {
      res.redirect('/users/login?error=\'Incorrect Username and/or Password!\'');
    }
  } else {
    res.send('Please enter Username and Password!');
    res.end();
  }
});

router.get('/users/forgetPassword', function (req, res) {
  res.render('pages/forgetPassword')
})
router.post('/users/forgetPassword', redirectHome, async function (req, res) {
  var username = req.body.username
  var email = req.body.email
  let code = 0;
  result = await Users.findAll({ raw: true, where: { email: email } })
  code = result[0].verificationCode
  const mailOptionsReset = {
    from: "rameezahmednode@gmail.com",
    to: email,
    subject: `Password Reset Request for ${username}`,
    text: `Your Password Reset Code is ${code}.`,
    html: `<a href="https://fypmanagementsystemheroku.herokuapp.com/users/resetPassword?code=${code}">Reset Password</a><br><p>Your Password Reset Code is ${code}.</p>`,
  };
  transporter.sendMail(mailOptionsReset, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log(`Email.sent to ${email}: ${info.response}`);
      res.redirect("/users/login");
    }
  })
})
router.get('/users/resetPassword', redirectHome, function (req, res) {
  res.render('pages/resetPassword');
})
router.post('/users/resetPassword', redirectHome, async function (req, res) {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password
  var code = req.body.code
  let result = await Users.findAll({ raw: true, where: { username: username, verificationCode: code } })
  let count = result.length;
  if (count == 1) {
    const user = await Users.update(
      { password: password },
      { where: { username: username, email: email } }
    )
    res.redirect("/users")
  }
  // mysqlConnection.query(`select count(*) from userregs where username='${username}' and email='${email}' and verificationCode=${code}`, function (err, result, fields) {
  //   let count = result[0]['count(*)']
  //   if (count == 1) {
  //     mysqlConnection.query(`Update userregs SET password='${password}' where username='${username}' and email='${email}'`, function (err, result) {
  //       if (!err) {
  //         res.redirect('/users')
  //       }
  //       else {
  //         console.log(err)
  //       }
  //     })
  //   }
  // })
})
router.get('/sendReport', function (req, res) {
  res.render('pages/sendReport');
})
router.post('/sendReport', function (req, res) {
  let email = req.body.email;
  const mailOptionsVerification = {
    from: "rameezahmednode@gmail.com",
    to: email,
    subject: "Reports from Node application",
    text: `Reports from Node application`,
    html: ({ path: 'https://fypmanagementsystemheroku.herokuapp.com/aboutus' }),
    attachments: [{
      filename: 'allusers.pdf',
      path: 'E:\\Fast CFD 18\\8. Fall 2022\\Web Programming\\ClassActivity01\\uploads\\allUsers.pdf'
    }]
  };
  transporter.sendMail(mailOptionsVerification, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log(`Email.sent to ${email}: ${info.response}`);
      res.redirect("/users/login");
    }
  })
})

router.get('/users/login/verify', [redirectLogin, redirectVerifiedUser], function (req, res) {
  let username = req.session.username
  res.render("pages/verifyuser", {
    username: username,
  })
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
router.get('/', function (req, res) {
  res.redirect("/users")
});

router.get('/home', homeController.get);
router.get('/aboutus', aboutController.get);
router.get('/contactus', contactController.get);
router.post('/user/addCommentReply?:userID', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  const comment = req.body.reply;
  const commentID = req.body.id;
  const username = req.session.username;
  const userID = req.query.userID;
  await commentsReply.create({ reply: comment, username: username, userCommentId: commentID });
  res.redirect(`/user?id=${userID}`);
})
router.post('/supervisors/supervisor/addCommentReply?:supervisorID', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  const comment = req.body.reply;
  const commentID = req.body.id;
  const username = req.session.username;
  const userID = req.query.supervisorID;
  await supervisorCommentReply.create({ reply: comment, username: username, supervisorCommentId: commentID });
  res.redirect(`/supervisors/supervisor?id=${userID}`);
})
router.get('/user/getCommentReply?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  console.log(id)
  const reply = await commentsReply.findAll({
    raw: true, where: { userCommentId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(reply)
});
router.get('/supervisors/supervisor/getCommentReply?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  console.log(id)
  const reply = await supervisorCommentReply.findAll({
    raw: true, where: { supervisorCommentId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(reply)
});
router.post('/user/addComment', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  const comment = req.body.comment;
  const userID = req.body.id;
  const currentUser = req.session.id;
  let cUser = await Users.findAll({ raw: true, where: { username: req.session.username } })
  const cID = cUser[0].id;
  console.log(cUser[0].id);
  const username = req.body.username;
  await userComments.create({ comment: comment, username: username, userregId: cID });
  res.redirect(`/user?id=${userID}`);
})
router.post('/supervisors/supervisor/addComment', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  const comment = req.body.comment;
  const userID = req.body.id;
  const email=req.body.email;
  const currentUser = req.session.id;
  let cUser = await Supervisors.findAll({ raw: true, where: { email: email } })
  const cID = cUser[0].id;
  console.log(cUser[0].id);
  const username = req.body.username;
  await supervisorComment.create({ comment: comment, username: username, supervisorRegId: cID });
  res.redirect(`/supervisors/supervisor?id=${userID}`);
})
router.post('/user/addRatings', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let rating = 0;
  if (req.body.rg1 != undefined) {
    rating = 5;
  }
  else if (req.body.rg2 != undefined) {
    rating = 4;
  }
  else if (req.body.rg3 != undefined) {
    rating = 3;
  }
  else if (req.body.rg4 != undefined) {
    rating = 2;
  }
  else if (req.body.rg5 != undefined) {
    rating = 1;
  }
  const review = req.body.review;
  const userID = req.body.id;
  const username = req.body.username;
  await userReviews.create({ username: username, review: review, ratings: rating, userregId: userID });
  res.redirect(`/user?id=${userID}`);
})
router.post('/supervisors/supervisor/addRatings', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let rating = 0;
  if (req.body.rg1 != undefined) {
    rating = 5;
  }
  else if (req.body.rg2 != undefined) {
    rating = 4;
  }
  else if (req.body.rg3 != undefined) {
    rating = 3;
  }
  else if (req.body.rg4 != undefined) {
    rating = 2;
  }
  else if (req.body.rg5 != undefined) {
    rating = 1;
  }
  const review = req.body.review;
  const userID = req.body.id;
  const username = req.body.username;
  await supervisorReview.create({ username: username, review: review, ratings: rating, supervisorRegId: userID });
  res.redirect(`/supervisors/supervisor?id=${userID}`);
})
router.get('/users', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  {
    const allUsers = await Users.findAll({ raw: true });
    let userCount = allUsers.length;
    let page = req.query.page ? req.query.page : 1;
    let usersPerPage = req.query.usersPerPage ? req.query.usersPerPage : 2;
    let startLimit = (page - 1) * usersPerPage;
    let totalPages = Math.ceil(userCount / usersPerPage);
    const listOfUsers = await Users.findAll({ raw: true, offset: startLimit, limit: usersPerPage });
    let user = (req.query.loggedinUser) ? req.query.loggedinUser : req.session.username;
    let role = req.session.role;
    res.render("pages/users", {
      data: listOfUsers,
      userCount,
      page,
      totalPages,
      usersPerPage,
      user: user,
      role: role
    });
    // console.log(req.query.search)
    // let userQuery = ""
    // if (req.query.search === undefined) {
    //   userQuery = `SELECT COUNT(*) FROM userregs`;
    // }
    // else {
    //   let fname = req.query.search;
    //   userQuery = `SELECT COUNT(*) FROM userregs where fname LIKE '%${fname}%'`;
    // }
    // mysqlConnection.query(userQuery, (err, totalUsers, fields) => {
    //   // let userCount = totalUsers[0]["COUNT(*)"];
    //   // let page = req.query.page ? req.query.page : 1;
    //   // let usersPerPage = req.query.usersPerPage ? req.query.usersPerPage : 2;
    //   // let startLimit = (page - 1) * usersPerPage;
    //   // let totalPages = Math.ceil(userCount / usersPerPage);

    //   //res.send(`${movieCount}`);
    //   let selectQuery = ""
    //   console.log(req.query.search)
    //   if (req.query.search === undefined) {
    //     selectQuery = `SELECT * FROM userregs 
    //     LIMIT ${startLimit}, ${usersPerPage}`;
    //   }
    //   else {
    //     let fname = req.query.search;
    //     console.log(fname)
    //     selectQuery = `SELECT * FROM userregs where fname LIKE '%${fname}%' LIMIT ${startLimit}, ${usersPerPage}`;
    //   }

    //   mysqlConnection.query(selectQuery, (err, users, fields) => {
    //     if (!err) {
    //       let user = (req.query.loggedinUser) ? req.query.loggedinUser : req.session.username;
    //       let role = req.session.role;
    //       console.log(users)
    //       res.render("pages/users", {
    //         data: listOfUsers,
    //         userCount,
    //         page,
    //         totalPages,
    //         usersPerPage,
    //         user: user,
    //         role: role
    //       });
    //     }
    //     else console.log(err);
    //   });
    // });
  }
});
router.get('/user?:id', [redirectLogin], async function (req, res) {
  let id = req.query.id;
  if (typeof (id) === undefined) {
    id = req.params.id
  }
  const user = await Users.findOne({ raw: true, where: { id: id } });
  const userRtg = await userReviews.findAll({ raw: true, where: { userRegId	: id } });
  let sum = 0;
  for (let i = 0; i < userRtg.length; i++) {
    sum += userRtg[i].ratings;
  }
  sum /= userRtg.length
  let role = req.session.role;
  let username = req.session.username;
  res.render('pages/user', {
    user: user,
    role: role,
    username: username,
    rating: sum
  })
})
router.get('/user/getComments?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  const comments = await userComments.findAll({
    raw: true, where: { userregId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(comments)
});
router.get('/user/getRatings?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  const comments = await userReviews.findAll({
    raw: true, where: { userregId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(comments)
});

router.get('/supervisors/supervisor/getComments?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  const comments = await supervisorComment.findAll({
    raw: true, where: { supervisorRegId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(comments)
});
router.get('/supervisors/supervisor/getRatings?:id', [redirectLogin, redirectUnVerifiedUser], async function (req, res) {
  let id = req.query.id;
  const ratings = await supervisorReview.findAll({
    raw: true, where: { supervisorRegId: id },
    // Add order conditions here....
    order: [
      ['updatedAt', 'DESC'],
    ],
  });
  res.json(comments)
});
router.get('/supervisors/supervisor?:id',redirectLogin,async function(req,res){
  let id = req.query.id;
  if (typeof (id) === undefined) {
    id = req.params.id
  }
  const supervisor = await Supervisors.findAll({ raw: true, where: { id: id } });
  console.log(supervisor);
  const supervisorRtg = await supervisorReview.findAll({ raw: true, where: { supervisorRegId: id } });
  let sum = 0;
  for (let i = 0; i < supervisorRtg.length; i++) {
    sum += supervisorRtg[i].ratings;
  }
  sum /= supervisorRtg.length
  let role = req.session.role;
  let username = req.session.username;
  res.render('pages/supervisor', {
    supervisor: supervisor,
    role: role,
    username: username,
    rating: sum
  })
})
// router.get('/supervisor?:id', [redirectLogin], async function (req, res) {
//   let id = req.query.id;
//   if (typeof (id) === undefined) {
//     id = req.params.id
//   }
//   const supervisor = await Supervisors.findOne({ raw: true, where: { id: id } });
//   const supRtg = await supervisorReview.findAll({ raw: true, where: { supervisorRegId	: id } });
//   let sum = 0;
//   for (let i = 0; i < supRtg.length; i++) {
//     sum += supRtg[i].ratings;
//   }
//   sum /= supRtg.length
//   let role = req.session.role;
//   let username = req.session.username;
//   res.render('pages/supervisor', {
//     supervisor: supervisor,
//     role: role,
//     username: username,
//     rating: sum
//   })
// })

router.get('/supervisors', async function (req, res) {
  const allSupervisors = await Supervisors.findAll({ raw: true });
  let supervisorCount = allSupervisors.length;
  let page = req.query.page ? req.query.page : 1;
  let supervisorsPerPage = req.query.supervisorsPerPage ? req.query.supervisorsPerPage : 2;
  let startLimit = (page - 1) * supervisorsPerPage;
  let totalPages = Math.ceil(supervisorCount / supervisorsPerPage);
  const supervisors = await Supervisors.findAll({ raw: true, offset: startLimit, limit: supervisorsPerPage });
  let user = (req.query.loggedinUser) ? req.query.loggedinUser : req.session.username;
  let role = req.session.role;
  res.render("pages/supervisors", {
    data: supervisors,
    supervisorCount,
    page,
    totalPages,
    supervisorsPerPage,
    user: user,
    role: role,
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
router.get('/users/insertData', redirectInvalidLogin, function (req, res) {
  res.render('pages/insertUser')
})
router.get('/users/registerUser', function (req, res) {
  res.render('pages/registerUser')
})
router.get('/supervisors/registerSupervisor', [redirectLogin], function (req, res) {
  res.render('pages/registerSupervisor')
})

router.get('/users/updateUser', redirectInvalidLogin, async function (req, res) {

  // create Request object
  var id = req.query.id
  let recordset = await Users.findAll({ raw: true, where: { id: id } })
  res.render('pages/updateUser', {
    data: recordset,
    id: id,
  })
  // mysqlConnection.query(`select * from userregs WHERE  id= ${id}`, function (err, recordset) {

  //   if (err) {
  //     console.log(err);
  //   }

  //   // send records as a response
  //   else {
  //     let jsonString = JSON.stringify(recordset)
  //     let JSONdata = JSON.parse(jsonString);
  //     data = recordset
  //     console.log(data)
  //     res.render('pages/updateUser', {
  //       data: data,
  //       id: id,
  //     })
  //   }

  // });
})
router.get('/supervisors/updateSupervisor', [redirectLogin], async function (req, res) {

  // create Request object

  var id = req.query.id
  var recordset = await findAll({ raw: true, where: { id: id } });
  res.render('pages/updateSupervisor', {
    data: recordset,
    id: id,
  })
})
router.get('/users/printUsers', async function (req, res) {

  let recordset = await Users.findAll({ raw: true })
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
})
router.get('/api/users', async function (req, res) {
  {
    // mysqlConnection.query('select * from userregs', function (err, recordset) {

    //   if (err) {
    //     console.log(err);
    //   }

    //   // send records as a response
    //   else {
    //     let jsonString = JSON.stringify(recordset)
    //     let JSONdata = JSON.parse(jsonString);
    //     data = JSONdata.recordset
    //     console.log(data)
    //     res.json({
    //       data: data
    //     }).sendStatus(200)
    //   }

    // });
    const listOfUsers = await Users.findAll({ raw: true });
    res.json(listOfUsers);
  }
})
router.post('/users/delete', redirectInvalidLogin, async function (req, res) {
  var id = req.body.id
  await Users.destroy({
    where: {
      id: id
    }
  });
  res.redirect('/users');
  // var Query = `DELETE FROM userregs WHERE id=${id}`
  // mysqlConnection.query(Query, function (err, recordset) {

  //   if (err) {
  //     console.log(err);
  //   }

  //   // send records as a response
  //   else {
  //     res.redirect('/users');
  //   }

  // });
})
router.post('/supervisors/delete', [redirectLogin], async function (req, res) {
  var id = req.body.id
  await Supervisors.destroy({
    where: {
      id: id
    }
  });
  res.redirect('/supervisors');
})
// router.post('/api/users/delete', function (req, res) {
//   var id = req.body.id
//   console.log(id);
//   var Query = `DELETE FROM userregs WHERE id=${id}`
//   mysqlConnection.query(Query, function (err, recordset) {

//     if (err) {
//       console.log(err);
//     }

//     // send records as a response
//     else {
//       res.json({
//         recordset: recordset
//       }).sendStatus(201);
//     }

//   });

// })
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}
router.post('/users/login/verify', [redirectLogin, redirectVerifiedUser], async function (req, res) {
  let code = req.body.code;
  let username = req.session.username;
  let data = await Users.findAll({ raw: true, where: { username: username } })
  if (data[0].verificationCode == code) {
    await Users.update(
      { isVerified: 1 },
      { where: { username: username } }
    )
    res.redirect("/users/logout")
    // mysqlConnection.query(`Update userregs SET isVerified=1 where username='${username}'`, function (err, result) {
    //   if (!err) {
    //     res.redirect("/users/logout")
    //   }
    //   else {
    //     res.redirect("/users/login/verify");
    //   }
    // })
  }
  else {
    res.render("pages/VerifyUser", {
      username,
      message: "Invalid Verification Code or data"
    })
  }
  // let Query = `select (verificationCode) from userregs where username = '${username}'`;
  // mysqlConnection.query(Query, function (err, data) {
  //   if (err) {
  //     console.log(err)
  //   }
  //   else {
  //     if (data[0].verificationCode == code) {
  //       mysqlConnection.query(`Update userregs SET isVerified=1 where username='${username}'`, function (err, result) {
  //         if (!err) {
  //           res.redirect("/users/logout")
  //         }
  //         else {
  //           console.log(err);
  //           res.redirect("/users/login/verify");
  //         }
  //       })
  //     }
  //     else {
  //       res.render("pages/VerifyUser", {
  //         username,
  //         message: "Invalid Verification Code"
  //       })
  //     }
  //   }
  // })

})
router.post('/users/registerUser', [redirectLogin], async function (req, res) {

  // create Request object

  var fname = req.body.fname
  var lname = req.body.lname
  var birthday = req.body.birthday
  var username = req.body.username
  var email = req.body.email
  var phone = req.body.phone
  var profilePic = req.body.profilePic
  var country = req.body.country
  var password = req.body.password
  var role = req.body.role
  let code = generateCode();
  const user = await Users.create({ fname: fname, lname: lname, birthday: birthday, username: username, role: role, email: email, phone: phone, profilePic: profilePic, country: country, password: password, verificationCode: code, createdAt: sequelize.fn('NOW'), updatedAt: sequelize.fn('NOW') });
  if (body(email).isEmail()) {
    res.render("pages/verifyuser", {
      username, code
    }, function (err, html) {
      const mailOptionsVerification = {
        from: "rameezahmednode@gmail.com",
        to: email,
        subject: "Your verification Code for node js application",
        text: `Your verification code is ${code}.`,
        html: `<a href="https://fypmanagementsystemheroku.herokuapp.com/users/login/verify?code=${code}">Verify User</a><br><p>Your Verification Code is ${code}.</p>`,
      };
      transporter.sendMail(mailOptionsVerification, function (error, info) {
        if (error) {
          console.log(error);
        }
        else {
          console.log(`Email.sent to ${email}: ${info.response}`);
          res.redirect("/users/login");
        }
      })
    })
    res.redirect('/users/login');
  }
  else {
    res.redirect("/users/login");
  }

  // var Query = `INSERT INTO userregs (fname,lname,birthday,username,email,phone,country,password,verificationCode,createdAt,updatedAt) VALUES('${fname}','${lname}','${birthday}','${username}','${email}','${phone}','${country}','${password}',${code},CURRENT_TIME(), CURRENT_TIME())`
  // mysqlConnection.query(Query, function (err, recordset) {

  //   if (err) {
  //     console.log(err);
  //   }

  //   // send records as a response
  //   else {
  //     if (body(email).isEmail()) {
  //       res.render("pages/VerifyUser", {
  //         username, code
  //       }, function (err, html) {
  //         const mailOptionsVerification = {
  //           from: "rameezahmednode@gmail.com",
  //           to: email,
  //           subject: "Your verification Code for node js application",
  //           text: `Your verification code is ${code}.`,
  //           html: `<a href="https://fypmanagementsystemheroku.herokuapp.com/users/login/verify?code=${code}">Verify User</a><br><p>Your Verification Code is ${code}.</p>`,
  //         };
  //         transporter.sendMail(mailOptionsVerification, function (error, info) {
  //           if (error) {
  //             console.log(error);
  //           }
  //           else {
  //             console.log(`Email.sent to ${email}: ${info.response}`);
  //             res.redirect("/users/login");
  //           }
  //         })
  //       })
  //       res.redirect('/users/login');
  //     }
  //     else {
  //       res.redirect("/users/login");
  //     }
  //   }

  // });
})
router.post('/supervisors/registerSupervisor', [redirectLogin], async function (req, res) {

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
  const supervisor = await Supervisors.create({
    name: name, dob: dob, gender: gender, email: email, phone: phone, country: country, department: department, profilePic: profilePic, experties: experties,
    password: password, groups: groups, createdAt: sequelize.fn('NOW'), updatedAt: sequelize.fn('NOW')
  });
  res.redirect('/supervisors');
  // var Query = `INSERT INTO supervisorReg (name,dob,gender,email,phone,country,department,experties,groups,password,profilePic) VALUES('${name}','${dob}','${gender}','${email}','${phone}','${country}','${department}','${experties}',${groups},'${password}','${profilePic}')`
  // mysqlConnection.query(Query, function (err, recordset) {

  //   if (err) {
  //     console.log(err);
  //   }

  //   // send records as a response
  //   else {
  //     res.redirect('/supervisors');
  //   }

  // });
})
// router.post('/api/users/registerUser', function (req, res) {

//   // create Request object

//   var fname = req.body.fname
//   var lname = req.body.lname
//   var birthday = req.body.birthday
//   var username = req.body.username
//   var email = req.body.email
//   var phone = req.body.phone
//   var country = req.body.country
//   var password = req.body.password
//   var profilePic = req.body.profilePic

//   // query to the database and insert the records

//   var Query = `INSERT INTO userregs (fname,lname,birthday,username,email,phone,country,password,profilePic) VALUES('${fname}','${lname}','${birthday}','${username}','${email}','${phone}','${country}','${password}','${profilePic}')`
//   mysqlConnection.query(Query, function (err, recordset) {

//     if (err) {
//       console.log(err);
//     }

//     // send records as a response
//     else {
//       res.json({
//         recordset: recordset
//       }).sendStatus(201);
//     }

//   });
// })
router.post('/users/updateUser', redirectInvalidLogin, async function (req, res) {

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
  let dataPassword = await Users.findAll({ raw: true, where: { id: id } })
  data = dataPassword
  if (data[0].password == oldpassword) {
    const user = await Users.update(
      { fname: fname, lname: lname, birthday: birthday, username: username, email: email, phone: phone, profilePic: profilePic, country: country, password: password, createdAt: sequelize.fn('NOW'), updatedAt: sequelize.fn('NOW') },
      { where: { id: id } }
    )
    res.redirect('/users');
  }
  else {
    var error = "Invalid Old Password"
    res.render("/users/updateUser?id=" + id, {
      error: "Invalid Password"
    })
  }
})
router.post('/supervisors/updateSupervisor', [redirectLogin], async function (req, res) {

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
  let recordset = await Supervisors.findAll({ raw: true, where: { id: id } });

  data = recordset
  if (oldpassword === undefined) {
    var error = "Invalid Old Password"
    res.render("/supervisors/updateSupervisor?id=" + id, {
      error: error
    })
  }
  else {
    if (data[0].password == oldpassword) {
      const user = await Users.update(
        { name: name, dob: dob, gender: gender, email: email, phone: phone, country: country, department: department, experties: experties, groups: groups, password: password, profilePic: profilePic, createdAt: sequelize.fn('NOW'), updatedAt: sequelize.fn('NOW') },
        { where: { id: id } }
      )
      res.redirect('/supervisors');
    }
    else {
      var error = "Invalid Old Password"
      res.render("/supervisors/updateSupervisor?id=" + id, {
        error: error
      })
    }
  }

  // mysqlConnection.query(`select (password) from supervisorReg where id=${id}`, function (err, recordset) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   else {
  //     data = recordset

  //     console.log(data[0].password)
  //     if (oldpassword === undefined) {
  //       var error = "Invalid Old Password"
  //       res.render("/supervisors/updateSupervisor?id=" + id, {
  //         error: error
  //       })
  //     }
  //     else {
  //       if (data[0].password == oldpassword) {
  //         var Query = `UPDATE supervisorReg SET name = '${name}', dob='${dob}', gender='${gender}', email='${email}', phone='${phone}', country='${country}', department='${department}',experties='${experties}',groups='${groups}',password='${password}', profilePic='${profilePic}' WHERE id=${id}`
  //         mysqlConnection.query(Query, function (err, recordset) {

  //           if (err) {
  //             console.log(err);
  //           }

  //           // send records as a response
  //           else {
  //             res.redirect('/supervisors');
  //           }

  //         });
  //       }
  //       else {
  //         var error = "Invalid Old Password"
  //         res.render("/supervisors/updateSupervisor?id=" + id, {
  //           error: error
  //         })
  //       }
  //     }
  //   }
  // })
})
// router.post('/api/users/updateUser', function (req, res) {

//   // create Request object
//   var id = req.body.id
//   var fname = req.body.fname
//   var lname = req.body.lname
//   var birthday = req.body.birthday
//   var username = req.body.username
//   var email = req.body.email
//   var phone = req.body.phone
//   var country = req.body.country
//   var password = req.body.password
//   var oldpassword = req.body.oldpassword

//   // query to the database and insert the records
//   // (fname,lname,birthday,username,email,phone,country,password)
//   mysqlConnection.query(`select (password) from userregs where id=${id}`, function (err, recordset) {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       let jsonString = JSON.stringify(recordset)
//       let JSONdata = JSON.parse(jsonString);
//       data = JSONdata.recordset
//       console.log(data)
//       if (data[0].password == oldpassword) {
//         var Query = `UPDATE userregs SET fname = '${fname}', lname='${lname}', birthday='${birthday}', username='${username}', email='${email}', phone='${phone}', country='${country}',password='${password}' WHERE id=${id}`
//         request.query(Query, function (err, recordset) {

//           if (err) {
//             console.log(err);
//           }

//           // send records as a response
//           else {
//             res.status(201).json({
//               recordset: recordset
//             });
//           }

//         });
//       }
//       else {
//         var error = "Invalid Old Password"
//         res.render("/users/updateUser?id=" + id, {
//           error: error
//         })
//       }
//     }
//   })
// });
module.exports = router, myStore