'use strict'
const path = require('path');
const db = {};
var express = require("express");
var Sequelize = require("sequelize");
var session = require("express-session");

// initalize sequelize with session store
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = new Sequelize(
   'f180323',
   'f180323',
   '123456789',
   {
      host: 'db4free.net',
      pool:{
         max: 5,
         min: 0,
         acquire: 30000,
         idle: 10000,
      },
      dialect: 'mysql',
   }
);
const sessiontble = sequelize.define("Sessions", {
   sid: {
      type: Sequelize.STRING,
      primaryKey: true,
   },
   userId: Sequelize.STRING,
   expires: Sequelize.DATE,
   data: Sequelize.TEXT,
});
sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});
db.sessiontble = sessiontble;
db.session = session;
db.SequelizeStore = SequelizeStore;
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.supervisorCommentsReply=require("./supervisorCommentsReply")(sequelize,Sequelize);
db.supervisorComment=require("./supervisorComments")(sequelize,Sequelize);
db.supervisorReview=require("./supervisorReview")(sequelize,Sequelize);
db.Supervisors=require("./supervisors")(sequelize,Sequelize);
db.Messages=require("./messages")(sequelize,Sequelize);
db.userComments = require("./userComments")(sequelize, Sequelize);
db.Users = require("./users")(sequelize, Sequelize);
db.userReviews = require("./userReview")(sequelize, Sequelize);
db.commentsReply = require("./commentsReply")(sequelize, Sequelize);
db.Supervisors.hasMany(db.supervisorComment,{onDelete:"cascade"});
db.Supervisors.hasMany(db.supervisorReview,{onDelete:"cascade"});
db.Users.hasMany(db.userReviews, { onDelete: "cascade" })
db.Users.hasMany(db.userComments, { onDelete: "cascade" })
db.supervisorComment.belongsTo(db.Supervisors)
db.supervisorReview.belongsTo(db.Supervisors)
db.userComments.belongsTo(db.Users);
db.userComments.hasMany(db.commentsReply, { onDelete: "cascade" })
db.userReviews.belongsTo(db.Users);
db.commentsReply.belongsTo(db.userComments);
db.supervisorComment.hasMany(db.supervisorCommentsReply);
db.supervisorCommentsReply.belongsTo(db.supervisorComment)
sequelize.sync().then(() => {
   console.log('tables created successfully!');
}).catch((error) => {
   console.error('Unable to create tables : ', error);
});
module.exports = db;