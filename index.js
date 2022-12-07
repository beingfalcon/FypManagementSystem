
const express = require('express');
const app = express();
const path = require('path');
const route=require("./routes/myRoutes");
const port = process.env.PORT || 3000;
var expressLayouts=require('express-ejs-layouts');
const messages = require('./models/messages');
app.set('view engine','ejs');
app.use(expressLayouts);
app.use(express.static (path.join(__dirname,"./public")));
app.use(express.static (path.join(__dirname,"./uploads")));
app.use(express.static (path.join(__dirname,"./views")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
let http = require('http').createServer(app);
let io =require("socket.io")(http);
const db = require("./models");
let Messages=db.Messages;
app.post("/get_messages", async function (req, res) {
  let messages=await Messages.findAll({raw:true,where:{sender:req.body.sender,reciever:req.body.receiver}})
  res.send(JSON.stringify(messages));
});
let users=[];
io.on("connection", function (socket) {
	console.log("User connected: ",  socket.id);

	socket.on("user_connected", function (username) {
		users[username] = socket.id;
		io.emit("user_connected", username);
	});

	socket.on("send_message", async function (data) {
		var socketId = users[data.receiver];
		socket.to(socketId).emit("message_received", data);
    await Messages.create({
      sender: data.sender,
      reciever:data.receiver,
      message: data.message,
    });
	});
});

app.use('/',route);
http.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


