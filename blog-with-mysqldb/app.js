//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var mysql = require('mysql');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


//mongoose.connect("mongodb+srv://admin-shreevar:lvVG1UdZDFMvzvek@cluster0-ddndx.mongodb.net/blogDB", { useNewUrlParser: true });
//mongoose.connect("mongodb+srv://admin-shreevar:lvVG1UdZDFMvzvek@cluster0-ddndx.mongodb.net/userDB", { useNewUrlParser: true });

// Mongoose DB connection and Schema start

/*
mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const blogSchema = new mongoose.Schema ({
  blogtitle: String,
  blogarticle: String
});

const Blog = mongoose.model("Blog",blogSchema);
*/
//// Mongoose DB connection and Schema End

//MySql DB connection and config started

var con = mysql.createConnection({
  host: "192.168.1.164",
  user: "user",
  password: "Test123",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//// MySql DB connection and config started

//Web Pages Start

app.get("/", function(request, response) {
  response.render("prehome");
});

app.get("/home", function(request, response) {
  con.query("SELECT * FROM blogstable", function (err, result, fields) {
      if (err) throw err;
      response.render("home", {
        start: homeStartingContent,
        myitems: result
      });
  });
});

app.get("/login", function(req, res) {
  if (req.session.loggedin){
    res.redirect("/home");
  } else {
  res.render("login");
}
});

app.get("/register", function(req, res){
  res.render("register");
});


app.get("/about", function(request, response) {
  response.render("about", {about: aboutContent});
});

app.get("/contact", function(request, response) {
  response.render("contact", {contact: contactContent});
});

app.get("/compose", function(request, response) {
  if (request.session.loggedin){
    response.render("compose");
  } else {
    response.redirect("/login");
  }
});

app.post("/register", function(req, res){
  item = [[req.body.email, req.body.password]];
  var sql = "INSERT INTO customers (email, password) VALUES ?";
    con.query(sql, [item], function (err, result) {
      if (err) {
        throw err;
        res.redirect("/register");
      } else {
        console.log("1 record inserted");
        req.session.loggedin = true;
        res.redirect("/home");
      }
    });
});

app.post("/login", function(req, res){

  var enteredemail = req.body.email;
  var enteredpassword = req.body.password;
  if (enteredemail && enteredpassword) {
		con.query('SELECT * FROM customers WHERE email = ? AND password = ?', [enteredemail, enteredpassword], function(error, results, fields) {
			if (results.length > 0) {
        req.session.loggedin = true;
        res.redirect("/home");
      }
      else {
          res.redirect("/login");
      }
    });
  } else {
      res.redirect("/login");
  }
});

app.get("/posts/:newpath", function(req, res) {
  var enteredtitle = _.lowerCase(req.params.newpath);
  con.query("SELECT * FROM blogstable WHERE blogtitle = ?", [enteredtitle], function (err, result, fields) {
     if (err) throw err;
     res.render("post", {newposttitle: result[0].blogtitle, newpostbody: result[0].blogbody});
   });
});

app.post("/", function(req, res) {

  var item  = [[req.body.blogtitle, req.body.blogarticle]];
  var sql = "INSERT INTO blogstable (blogtitle, blogbody) VALUES ?";
  con.query(sql, [item], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      res.redirect("/home");
    });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started successfully");
});
