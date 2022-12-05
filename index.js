
const express = require('express');
const app = express();
const path = require('path');
const route=require("./routes/myRoutes");
const port = process.env.PORT || 3000;
var expressLayouts=require('express-ejs-layouts');
app.set('view engine','ejs');
app.use(expressLayouts);
app.use(express.static (path.join(__dirname,"./public")));
app.use(express.static (path.join(__dirname,"./uploads")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/',route);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});