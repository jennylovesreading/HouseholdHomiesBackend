const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    address:{
      type: String,
      required: true
    },
    members: {
      type: Array,
      required: true
    },
    chores: {
      type: Array,
      required: true
    },
    head:{
      type: Number,
      required: true
    }
  });
  
  const Group = mongoose.model("Group", GroupSchema);
  
  module.exports = Group;