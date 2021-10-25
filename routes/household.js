const express = require("express");
const groupModel = require("../models/group.model");
const freeclimbSDK = require('@freeclimb/sdk');
const app = express();

require('dotenv').config();

// messaging handle
app.post('/createGroup', (request, response) => {
    const groupInfo = request.body;
    let errors = []

    const accountId = 'AC6fd1d1c6d22f8904aa7a70985f5ba104b79ef7e4';
    const apiKey = '4b225058cdaba2c6acb36c048a3df9e520fb98b5';
    const freeclimb = freeclimbSDK(accountId, apiKey);
    
    if(request.body.members.length < 2) {
        errors.push("PLEASE ADD AT LEAST TWO MEMBER");
    }

    if(errors.length > 0) {
        // MEANS SOMETHING WENT WRONG -- DECIDE WHAT WE WANT TO DISPLAY/HOW ------------------------------------------
        console.log(errors);
        response.sendStatus(200);
      } else {
        groupModel.findOne({ houseName: request.user["houseName"] })
        .then((user) => {
            if(user) {
                // User with this username already exists
                errors.push("Account already has a group - if it enters here something is effed");
                // -----------------------------------------------------DISPLAY HOW WE WANT TO ----------------------
                console.log(errors);
                response.sendStatus(200);
            } else {
                const newGroup = new groupModel({
                    houseName: request.user["houseName"],
                    members: groupInfo.members,
                    chores: groupInfo.chores
                  });
                
                
                newGroup.save()
                .then(() => {
                    console.log("GROUP REGISTERED");
                
                    let from = '+18162562790'
                
                    for(const user of groupInfo.members) {
                        let to = user["number"];
                        freeclimb.api.messages.create(from, to, 'Hey ' + user["name"] + '! You have joined the household ' + request.user["houseName"] + '!').catch(err => {console.log(err)})
                    }
                    
                    // send the data with group info
                    response.redirect("/")
                })
            }
        })
        
    }
})

module.exports = app;