var mysql = require('mysql');
const util = require("util");
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
module.exports = {
  get: (req, res) => {
    console.log(req.query.search)
    let userQuery=""
    if (req.query.search === undefined) {
      userQuery = `SELECT COUNT(*) FROM userreg`;
    }
    else{
      let fname=req.query.search;
      userQuery = `SELECT COUNT(*) FROM userreg where fname LIKE '%${fname}%'`;
    }
    mysqlConnection.query(userQuery, (err, totalUsers, fields) => {
      let userCount = totalUsers[0]["COUNT(*)"];
      let page = req.query.page ? req.query.page : 1;
      let usersPerPage = req.query.usersPerPage ? req.query.usersPerPage : 2;
      let startLimit = (page - 1) * usersPerPage;
      let totalPages = Math.ceil(userCount / usersPerPage);

      //res.send(`${movieCount}`);
      let selectQuery=""
      console.log(req.query.search)
      if (req.query.search === undefined) {
        selectQuery = `SELECT * FROM userreg 
        LIMIT ${startLimit}, ${usersPerPage}`;
      }
      else{
        let fname=req.query.search;
        console.log(fname)
        selectQuery = `SELECT * FROM userreg where fname LIKE '%${fname}%' LIMIT ${startLimit}, ${usersPerPage}`;
      }

      mysqlConnection.query(selectQuery, (err, users, fields) => {
        if (!err) {
          let user=req.query.loggedinUser
          console.log(users)
          res.render("pages/users", {
            data: users,
            userCount,
            page,
            totalPages,
            usersPerPage,
            user:user
          });
        }
        else console.log(err);
      });
    });
  }
}