'use strict'
const path = require('path');
const db = {};
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  'fypmanagementsystem',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql'
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
db.Users.hasMany(db.userReviews,{onDelete:"cascade"})
db.Users.hasMany(db.userComments,{onDelete: "cascade"})
db.userComments.belongsTo(db.Users);
db.userReviews.belongsTo(db.Users);
sequelize.sync().then(() => {
    console.log('tables created successfully!');
 }).catch((error) => {
    console.error('Unable to create tables : ', error);
 });
module.exports = db;