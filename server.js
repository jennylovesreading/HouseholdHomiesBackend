const express = require("express");
const mongoose = require("mongoose");
const Router = require("./routes/users");
const cors = require('cors');

const app = express();

// configs -----------------------------------------------------------------------------------------------------------
const databaseURI = require('./config/db.config').MongoURI; // Database Config

// make a connection to mongoDB database
mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log('MongoDB connected...')) 
    .catch(err => console.error("MongoDB connection error", err));

// middlewares -------------------------------------------------------------------------------------------------------
app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
app.use(cors());

app.use(Router);

// routes ------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
    res.json({ message: "EMPTY PAGE" });
  });
  
// require('./routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});