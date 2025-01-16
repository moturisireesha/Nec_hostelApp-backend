// models/Request.js
const mongoose = require("mongoose");

const requestsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: String,
    status: String, // enum=[submitted, accepted,arrived,rejected]
    submitted: {
      time: Date,
    },
    accepted: {
      eid: String,
      name: String,
      time: Date,
    },
    rejected: {
      eid: String,
      name: String,
      time: Date,
    },
    arrived: {
      eid: String,
      name: String,
      time: Date,
    },
    name: String,
    rollNo: String,
    hostelId: String,
    phoneNo: String,
    parentPhoneNo: String,
    reason:String,
    isActive:Boolean,

    // permission
    date:Date,
    fromTime:Date,
    toTime:Date,
    // leave
    fromDate:Date,
    toDate:Date,

    delay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Method to check and update the delay status
// requestsSchema.methods.checkAndUpdateDelay = function () {
//   if (this.returnDate && this.return_time) {
//     const returnDateTime = new Date(
//       `${this.returnDate.toISOString().split("T")[0]}T${this.return_time}:00`
//     );
//     const endDateTime = new Date(
//       `${this.endDate.toISOString().split("T")[0]}T${this.toTime}:00`
//     );

//     if (returnDateTime > endDateTime) {
//       this.delay = true;
//     } else {
//       this.delay = false;
//     }
//   }
//   return this.delay;
// };

module.exports = mongoose.model("Request", requestsSchema);
