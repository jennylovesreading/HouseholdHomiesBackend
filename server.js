const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();

// configs ----------------------------------------------------------------------------------------------------------
const databaseURI = require('./config/db.config').MongoURI; // Database Config
require("./config/passport")(passport); // Passport Config
console.log("to make connection to mongoDB");
// make a connection to mongoDB database ----------------------------------------------------------------------------
mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log('MongoDB connected...')) 
    .catch(err => console.error("MongoDB connection error", err));

// middleware -------------------------------------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://householdhomies-backend.herokuapp.com/", "https://61a7d0ff11bb9a00078446da--romantic-wright-f98d7e.netlify.app/"], // <-- location of the react app were connecting to
    credentials: true,
  })
);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

// Allows for access to user information after login
app.use(function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// routes ------------------------------------------------------------------------------------------------------------
app.use(require('./routes/users'));
app.use(require('./routes/createGroup'));
app.use(require('./routes/group'));

// set port, listen for requests -------------------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;
console.log("about to listen to port");
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
