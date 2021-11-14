const express = require("express");
const groupModel = require("../models/group");
const app = express();


app.put("/updateChore", (req, res) => {
    console.log("Updating chore...");
    groupModel.findOne({ address: req.user["address"] })
    .then((group) => {
        let { chores } = req.body;
        console.log(chores)
        groupModel.findOneAndUpdate({ address: group.address }, { chores: chores }, { new: true }, (err, group) => {
            // Handle any possible database errors
            if (err) 
                return res.status(500).send(err);
            
            console.log("updated chore successfully");

           return res.send(group);
        })
    }).catch(err => console.log(err));
});

module.exports = app;