var express = require("express"),
  mongoose = require("mongoose"),
  passport = require('passport'),
  bodyParser = require("body-parser"),
  User = require("./models/user.js"),
  LocalStrategy = ("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");
//connect to database
mongoose.connect('mongodb://localhost/auth_demo', { useMongoClient: true });
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//express session
app.use(require("express-session")({
  secret: "this is the secret key",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//these methods are responsible for reading the session,
//taking the data from the session to decoded and unencoded
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//===============
//ROUTES
//==============
app.get("/", function(req, res){
  res.render("home");
});

//secret route runs isLoggedIn before anything else
app.get("/secret", isLoggedIn, function(req, res){
  res.render("secret");
});

//Auth Routes
//show sign up form
app.get("/register", function(req, res){
  res.render("register");
})
//handling user sign up
app.post("/register", function(req, res) {
  var passWord = req.body.password;
  var userName = req.body.username;
  //pass user object and pass the password separetly, saves the hash version
  User.register(new User({username: userName}), passWord, function(err, user){
    if(err){
      console.log(err);
      return res.render("register");
    } else {
      //logs the user in
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secret");
      });
    }
  });
});

// LOGIN ROUTES

//render login form
app.get("/login", function(req, res){
  res.render("login");
});

//login logic
//middleware
//passport automatically takes the data from the form
app.post("/login", passport.authenticate("local", {
  //provide an object with two parameters
  successRedirect: '/secret',
  failureRedirect: "/login"
}), function(req, res){

});

//logout route
app.get("/logout", function(req, res){
  //passport log the user out
  req.logout();
  res.redirect("/");
});

//writing a middleware
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

//Start server
app.listen(3000, function(){
  console.log("server started");
});
