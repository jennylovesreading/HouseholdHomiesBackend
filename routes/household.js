const express = require("express");
const groupModel = require("../models/group");
const freeclimbSDK = require('@freeclimb/sdk');
const axios = require("axios");
const app = express();

require('dotenv').config();
const accountId = 'ACcabe723dfe4021d7a77923476fa5bd43454d8c3e';
const apiKey = 'f750bdbec90a4febc3aee6a6bbd88f70e8418d37';
const freeclimb = freeclimbSDK(accountId, apiKey);

app.post('/incomingSms', (req, res) => {
    let to = '+13134002132' //your Verified Number
    let from = '+18333412057' //your FreeClimb Number
    console.log(res);
    //response.body has message and from number that we will check with if statement
    //if message returned is something 
    freeclimb.api.messages.create(from, to, 'Hey! we are indicating we have received a text').catch(err => {console.log(err)})
  });

app.get("/", (req, res) => {
    res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

app.get("/group", (req, res) => {
    if(req.user) {
        console.log("here");
        groupModel.findOne({ address: req.user["address"] })
        .then((group) => {
            if(group) {
                res.send(group);
            }
        })
    } else {
        res.sendStatus(200);
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// messaging handle
app.post('/createGroup', (req, res) => {
    const groupInfo = req.body;
    let errors = []

    console.log("I have entered create group");

    const accountId = 'ACcabe723dfe4021d7a77923476fa5bd43454d8c3e';
    const apiKey = 'f750bdbec90a4febc3aee6a6bbd88f70e8418d37';
    const freeclimb = freeclimbSDK(accountId, apiKey);
    
    if(req.body.members.length < 2) {
        errors.push("PLEASE ADD AT LEAST TWO MEMBER");
    }

    if(errors.length > 0) {
        // MEANS SOMETHING WENT WRONG -- DECIDE WHAT WE WANT TO DISPLAY/HOW ------------------------------------------
        console.log(errors);
        res.send(errors);
      } else {
        groupModel.findOne({ address: req.user["address"] })
        .then((user) => {
            if(user) {
                // User with this username already exists
                errors.push("Account already has a group - if it enters here something is effed");
                // -----------------------------------------------------DISPLAY HOW WE WANT TO ----------------------
                console.log(errors);
                res.send("Account already has a group - if it enters here something is effed");
            } else {
                //create head before group save
                for(const user of groupInfo.members) { // inform members theyve joined the group
                    user["completed"] = false;
                }

                initialHead = Math.floor(getRandomInt(0, groupInfo.members.length));
                const newGroup = new groupModel({
                    address: req.user["address"],
                    members: groupInfo.members,
                    chores: groupInfo.chores,
                    head: initialHead
                });
                
                newGroup.save()
                .then(() => {              
                    let from = '+18333412057'
                    
                    console.log("about to send created group text");
                    for(const user of groupInfo.members) { // inform members theyve joined the group
                        let to = user["number"];
                        freeclimb.api.messages.create(from, to, 'Hey ' + user["name"] + '! You have joined the household ' + req.user["address"] + '!')
                        .catch(err => console.log(err))
                    }

                    setInterval(() => {
                        groupModel.findOne({ address: req.user["address"] })
                        .then((group) => {
                            if(group) {
                                console.log("Sending out chores...");
                                const accountId = 'ACcabe723dfe4021d7a77923476fa5bd43454d8c3e';
                                const apiKey = 'f750bdbec90a4febc3aee6a6bbd88f70e8418d37';
                                const freeclimb = freeclimbSDK(accountId, apiKey);

                                let from = '+18333412057'
                                member = 0

                                while(member < group.members.length) {
                                    let to = group.members[member]["number"];

                                    let chorePos = group.head + member;

                                    if(chorePos >= group.members.length) {
                                        chorePos = chorePos % group.members.length;
                                    }
                                    
                                    var chores = group.chores[chorePos];

                             
                                    freeclimb.api.messages.create(from, to, 'Hey ' + group.members[member]["name"] + '! Your chores for the week are:\n' + chores)
                                    .catch(err => console.log(err))
                                    
                                    getMessages().then(messages => {
                                        // Use messages
                                        console.log(messages)
                                    }).catch(err => {
                                        // Catch Errors
                                    })
                                    

                                    member++;
                                }
                            } else {
                                console.log("Couldnt find group");
                            }

                            
                        //send chores text again(already handled)
                        //send FINAL TEXT (remind all your housemates to do their chores)
                        
                            var d = new Date();
                            if(d.getDay()===0){ //if it becomes sunday
                                //then update head
                                console.log("Updating head...");
                                groupModel.findOne({ address: req.user["address"] })
                                .then((group) => {
                                    let newHead = group.head + 1;

                                    if(newHead >= group.members.length) {
                                        newHead = newHead % group.members.length;
                                    }
                                    
                                    groupModel.findOneAndUpdate({ address: group.address }, { head: newHead }, { new: true }, (err, group) => {
                                        // Handle any possible database errors
                                        if (err) 
                                            return res.status(500).send(err);

                                        //return res.send(group);
                                    })
                                });
                            }
                            

                        })

                        
                    }, 86400000)

                    
                    res.sendStatus(200)
                }).catch((err) => console.log(err))
            }
        })
    }
})

app.get("/sendChores", (req, res) => {
    groupModel.findOne({ address: req.user["address"] })
    .then((group) => {
        if(group) {
            console.log("Sending out chores...");
            const accountId = 'ACcabe723dfe4021d7a77923476fa5bd43454d8c3e';
            const apiKey = 'f750bdbec90a4febc3aee6a6bbd88f70e8418d37';
            const freeclimb = freeclimbSDK(accountId, apiKey);

            let from = '+18333412057'
            member = 0

            while(member < group.members.length) {
                let to = group.members[member]["number"];

                let chorePos = group.head + member;

                if(chorePos >= group.members.length) {
                    chorePos = chorePos % group.members.length;
                }
                
                var chores = group.chores[chorePos];

                freeclimb.api.messages.create(from, to, 'Hey ' + group.members[member]["name"] + '! Your chores for the week are:\n' + chores)
                .catch(err => console.log(err))

                member++;
            }
        } else {
            console.log("Couldnt find group");
        }
        res.sendStatus(200);
    })
});

app.put("/updateHead", (req, res) => {
    console.log("Updating head...");
    groupModel.findOne({ address: req.user["address"] })
    .then((group) => {
        let newHead = group.head + 1;

        if(newHead >= group.members.length) {
            newHead = newHead % group.members.length;
        }
        
        groupModel.findOneAndUpdate({ address: group.address }, { head: newHead }, { new: true }, (err, group) => {
            // Handle any possible database errors
            if (err) 
                return res.status(500).send(err);
            
                console.log("testing");

           return res.send(group);
        })
    });
});
  
  

  async function getMessages() {
    // Create array to store all members 
    const messages = []
    // Invoke GET method to retrieve initial list of members information
    const first = await freeclimb.api.messages.getList()
    messages.push(...first.messages)
    // Get Uri for next page
    let nextPageUri = first.nextPageUri
    // Retrieve entire members list 
    while (nextPageUri) {
      const nextPage = await freeclimb.api.messages.getNextPage(nextPageUri)
      messages.push(...nextPage.messages)
      nextPageUri = nextPage.nextPageUri
    }
    return messages
  }
module.exports = app;