// models/HolidayMsg.js
const mongoose = require('mongoose');

const HolidayMsgSchema = new mongoose.Schema(
  {
    occasion: { type: String, required: true },
    sendBy: { type: String, required: true },
    college: { type: String, required: true},
    Year: {type:String,required: true},
    fromDate: Date,
    toDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HolidayMsg", HolidayMsgSchema);
