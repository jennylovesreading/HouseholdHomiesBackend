const express = require("express");
const bcrypt = require('bcryptjs');
const userModel = require("../models/user.model");
const app = express();

app.post("/registerUser", async (request, response) => {
    const userSubmitted = request.body
    console.log("userSubmitted");
    console.log(userSubmitted);
    let errors = []
  
    if(!userSubmitted.firstName || !userSubmitted.lastName || !userSubmitted.username || !userSubmitted.email || !userSubmitted.password || !userSubmitted.confirmPassword || !userSubmitted.number) {
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
      response.sendStatus(200);
    } else {
      // user information has been validated
      userModel.findOne({ email: userSubmitted.email }) // check for registered email
      .then((user) => {
        if(user) {
          // User with this email already exists
          errors.push("EMAIL ALREADY REGISTERED");
          // -----------------------------------------------------DISPLAY HOW WE WANT TO -----------------------
          console.log(errors);
          response.sendStatus(200);
        } else {
          userModel.findOne({ username: userSubmitted.username }) // check for registered username
          .then((user) => {
            if(user) {
              // User with this username already exists
              errors.push("USERNAME ALREADY REGISTERED");
              // -----------------------------------------------------DISPLAY HOW WE WANT TO ----------------------
              console.log(errors);
              response.sendStatus(200);
            } else {
              // user is now being created using our model
              const newUser = new userModel({
                firstName: userSubmitted.firstName,
                lastName: userSubmitted.lastName,
                username: userSubmitted.username,
                email: userSubmitted.email,
                password: userSubmitted.password,
                number: userSubmitted.number
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
            
                    // PROBABLY REDIRECT TO THE SITE PAGE -----------------------------------------------------
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
    }
});

app.get("/users", async (request, response) => {
    const users = await userModel.find({});
  
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

module.exports = app;