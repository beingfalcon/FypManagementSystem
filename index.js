
const express = require('express');
const app = express();
const path = require('path');
const route = require("./routes/myRoutes");
const port = process.env.PORT || 3000;
var expressLayouts = require('express-ejs-layouts');
const messages = require('./models/messages');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./uploads")));
app.use(express.static(path.join(__dirname, "./views")));
require('dotenv').config({ path: __dirname + '/.env' })
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSSequelize = require('@adminjs/sequelize')
let http = require('http').createServer(app);
let io = require("socket.io")(http);
const db = require("./models");
const { sequelize } = require('./models');
let Messages = db.Messages;
let Users = db.Users;
let commentsReply = db.commentsReply;
let userReview = db.userReviews;
let userComments = db.userComments;
let message = db.Messages;
app.post("/get_messages", async function (req, res) {
	let messages = await Messages.findAll({ raw: true, where: { sender: req.body.sender, reciever: req.body.receiver } })
	res.send(JSON.stringify(messages));
});
let users = [];
io.on("connection", function (socket) {
	console.log("User connected: ", socket.id);

	socket.on("user_connected", function (username) {
		users[username] = socket.id;
		io.emit("user_connected", username);
	});

	socket.on("send_message", async function (data) {
		var socketId = users[data.receiver];
		socket.to(socketId).emit("message_received", data);
		await Messages.create({
			sender: data.sender,
			reciever: data.receiver,
			message: data.message,
		});
	});
});
app.use('/', route);
// Adminjs COnfiguration

const DEFAULT_ADMIN = {
	email: 'rameez',
	password: '123456789',
}

const authenticate = async (email, password) => {
	if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
		return Promise.resolve(DEFAULT_ADMIN)
	}
	return null
}
AdminJS.registerAdapter({
	Resource: AdminJSSequelize.Resource,
	Database: AdminJSSequelize.Database,
})
const adminOptions = {
	// We pass Category to `resources`
	databases: [sequelize],
}
const usersNavigation = {
	name: 'Users',
	icon: 'User',
}
const messageNavigation = {
	name: 'Messages',
	icon: 'Chat',
}
const commentNavigation = {
	name: 'Comments',
	icon: 'Chat',
}
const commentReplyNavigation = {
	name: 'Comments Reply',
	icon: 'Chat',
}
const reviewNavigation = {
	name: 'Review',
	icon: 'Chat',
}
const admin = new AdminJS({
	adminOptions,
	resources: [
		{
			resource: Users, options: {
				navigation: usersNavigation,
			}
		},
		{
			resource: userReview, options: {
				navigation: reviewNavigation,
			}
		},
		{
			resource: userComments, options: {
				navigation: commentNavigation,
			}
		},
		{
			resource: commentsReply, options: {
				navigation: commentReplyNavigation,
			}
		},
		{
			resource: message,
			options: {
				navigation: messageNavigation, usersNavigation,
			},
		}
	]
})
const adminRouter = AdminJSExpress.buildRouter(admin)
app.use(admin.options.rootPath, adminRouter)

http.listen(port, () => {
	console.log(`http://localhost:${port}${admin.options.rootPath}`);
});


