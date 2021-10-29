const express = require("express");
const groupModel = require("../models/group");
const freeclimbSDK = require('@freeclimb/sdk');
const app = express();

require('dotenv').config();

app.get("/", (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// messaging handle
app.post('/createGroup', (request, response) => {
    const groupInfo = request.body;
    console.log(groupInfo);
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
        response.send(errors);
      } else {
        groupModel.findOne({ houseName: request.user["houseName"] })
        .then((user) => {
            if(user) {
                // User with this username already exists
                errors.push("Account already has a group - if it enters here something is effed");
                // -----------------------------------------------------DISPLAY HOW WE WANT TO ----------------------
                console.log(errors);
                response.send("Account already has a group - if it enters here something is effed");
            } else {
                console.log("HERERERe");
                console.log(request.user);
                //create head before group save
                for(const user of groupInfo.members) { // inform members theyve joined the group
                    user["completed"] = false;
                }

                initialHead = Math.floor(getRandomInt(0, groupInfo.members.length));
                const newGroup = new groupModel({
                    houseName: request.user["houseName"],
                    members: groupInfo.members,
                    chores: groupInfo.chores,
                    head: initialHead
                });
                
                newGroup.save()
                .then((res) => {
                    console.log("GROUP REGISTERED");
                    console.log(res);
                
                    let from = '+18162562790'
                    
                    for(const user of groupInfo.members) { // inform members theyve joined the group
                        let to = user["number"];
                        freeclimb.api.messages.create(from, to, 'Hey ' + user["name"] + '! You have joined the household ' + request.user["houseName"] + '!')
                        .catch(err => console.log(err))
                    }

                    sendChoresText(newGroup);
                    // send the data with group info
                    response.sendStatus(200)
                }).catch((err) => console.log(err))
            }
        })
        
    }
})

//once a group is created, our infinite cycle of texts begins 
function sendChoresText(group){
//set interval for every week
//set interval for every day
//loop through chores array based on head
    let from = '+18162562790'
    while(i < group.members.length) {
        let to = group.members[i]["number"];

        freeclimb.api.messages.create(from, to, 'Hey ' + group.members[i]["name"] + '! Your chores for the week are:')
        .catch(err => console.log(err))
    }
}

module.exports = app;