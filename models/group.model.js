const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    members: {
      type: Array,
      required: true,
    },
    chores: {
      type: Array
    }
  });
  
  const Group = mongoose.model("Group", GroupSchema);
  
  module.exports = Group;