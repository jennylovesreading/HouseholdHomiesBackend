const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const userModel = require('../models/user.model');

module.exports = function(passport) {
  passport.use(new LocalStrategy({ username: 'username' }, function(username, password, done){
      // Match user
      userModel.findOne({ username: username }).then(function(user){
        if (!user) {
          return done(null, false, { message: 'That username is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, function(err, isMatch){
          if (err){
            throw err;
          } 

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      }).catch(function(err){
          console.log(err);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userModel.findById(id, function(err, user) {
      done(err, user);
    });
  });
};