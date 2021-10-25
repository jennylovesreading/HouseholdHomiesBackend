const express = require("express");
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// configs -----------------------------------------------------------------------------------------------------------
const databaseURI = require('./config/db.config').MongoURI; // Database Config
require('./config/passport')(passport); // Passport Config

// make a connection to mongoDB database
mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log('MongoDB connected...')) 
    .catch(err => console.error("MongoDB connection error", err));

// middlewares -------------------------------------------------------------------------------------------------------
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors());

app.use(session({
    secret: 'secret key',
    resave: true,
    saveUninitialized: true
})); // session to keep track of logged in user

app.use(passport.initialize());
app.use(passport.session());

// Allows for access to user information after login
app.use(function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// routes ------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
    res.send(req.user);
});

app.use(require('./routes/users'));
app.use(require('./routes/household'));

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});