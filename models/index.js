'use strict'
const path = require('path');
const db = {};
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  'sql9582209',
  'sql9582209',
  'JHTI8KJ9bq',
  {
    host: 'sql9.freesqldatabase.com',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.userComments = require("./userComments")(sequelize, Sequelize);
db.Users = require("./users")(sequelize, Sequelize);
db.userReviews = require("./userReview")(sequelize, Sequelize);
db.commentsReply = require("./commentsReply")(sequelize, Sequelize);
db.Users.hasMany(db.userReviews,{onDelete:"cascade"})
db.Users.hasMany(db.userComments,{onDelete: "cascade"})
db.userComments.belongsTo(db.Users);
db.userComments.hasMany(db.commentsReply,{onDelete: "cascade"})
db.userReviews.belongsTo(db.Users);
db.commentsReply.belongsTo(db.userComments);
sequelize.sync().then(() => {
    console.log('tables created successfully!');
 }).catch((error) => {
    console.error('Unable to create tables : ', error);
 });
module.exports = db;