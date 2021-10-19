const express = require("express");
const mongoose = require("mongoose");
const Router = require("./routes/routes");
const cors = require('cors');

const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// make a connection to mongoDB database
const databaseURI = require('./config/db.config').MongoURI; // Database Config

mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log('MongoDB connected...')) 
    .catch(err => console.error("MongoDB connection error", err));

app.use(Router);

// routes
app.get("/", (req, res) => {
    res.json({ message: "EMPTY PAGE" });
  });
// require('./routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});