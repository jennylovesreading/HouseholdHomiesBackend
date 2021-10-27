const express = require("express");
const bcrypt = require('bcryptjs');
const userModel = require("../models/user.model");
const passport = require("passport");
const app = express();

// Login Page
app.get('/login', function(req, res){
  res.send("/login");
});

// Registration Page
app.get('/register', function(req, res){
  res.send("/register");
});

//NEED to handle redirection  of submit button on register and login form, not sure if that goes in backend
//or frontend
app.post("/register", async (request, response) => {
    const userSubmitted = request.body
    let errors = []
  
    if(!userSubmitted.houseName|| !userSubmitted.username || !userSubmitted.password || !userSubmitted.confirmPassword) {
      errors.push("PLEASE FILL IN ALL FIELDS");
    } else {  
      if(userSubmitted.username.length < 6) {
        errors.push("USERNAME TOO SHORT");
      }
  
      if(userSubmitted.password.length < 6) {
        errors.push("PASSWORD TOO SHORT");
      }

      if(userSubmitted.password !== userSubmitted.confirmPassword) {
        errors.push("PASSWORDS DO NOT MATCH");
      }
    }
    
    if(errors.length > 0) {
      // MEANS SOMETHING WENT WRONG -- DECIDE WHAT WE WANT TO DISPLAY/HOW ------------------------------------------
      console.log(errors);
      response.send(errors);
    } else {
      // user information has been validated
      userModel.findOne({ username: userSubmitted.username }) // check for registered username
      .then((user) => {
        if(user) {
          // User with this username already exists
          errors.push("USERNAME ALREADY REGISTERED");
          // -----------------------------------------------------DISPLAY HOW WE WANT TO ----------------------
          console.log(errors);
          response.send(errors);
        } else {
          // user is now being created using our model
          const newUser = new userModel({
            houseName: userSubmitted.houseName,
            username: userSubmitted.username,
            password: userSubmitted.password,
          });
          
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) {
                throw err;
              }
        
              newUser.password = hash;
        
              newUser.save()
              .then(() => {
                console.log("USER REGISTERED");
                response.sendStatus(200);
              })
              .catch((err) => {
                console.log("ERROR REGISTERING USER");
                console.log(err);
              });
            });
          });
        }
      });
    }
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      return next(err); 
    }

    if (!user) { 
      console.log("redirected to login")
      return res.sendStatus(200);
    }

    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      console.log("success")
      return res.send(user);
    });
  })(req, res, next);
});

// Logout Handle
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = app;
