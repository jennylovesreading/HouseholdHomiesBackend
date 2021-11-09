const express = require("express");
const bcrypt = require('bcryptjs');
const User = require("../models/user");
const passport = require("passport");
const e = require("express");
const app = express();

//NEED to handle redirection  of submit button on register and login form, not sure if that goes in backend
//or frontend
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
});

app.post("/register", (req, res) => {
  const {address, username, password, confirmPassword} = req.body;
  let errors = [];

  if(!address|| !username || !password || !confirmPassword) {
    errors.push("PLEASE FILL IN ALL FIELDS");
  } else {  
    if(username.length < 6) {
      errors.push("USERNAME TOO SHORT");
    }

    if(password !== confirmPassword) {
      errors.push("PASSWORDS DO NOT MATCH");
    } else {
      if(password.length < 6) {
        errors.push("PASSWORD TOO SHORT");
      }
    } 
  }

  if(errors.length > 0) {
    res.send(errors);
  } else {
    User.findOne({ username: username }, async (err, user) => {
      if (err) throw err;

      if (user) {
        errors.push("Username is taken");
        res.send(errors);
      }

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
          address: address,
          username: username,
          password: hashedPassword,
        });
  
        await newUser.save().then(() => {
          res.send("User Created");
        }).catch(() => {
          res.send("Failed so Create User");
        });
      }
    });
  }
});

// Logout Handle
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = app;
