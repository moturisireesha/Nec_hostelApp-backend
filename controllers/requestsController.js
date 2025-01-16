const Request = require("../models/Requests");
const Hosteler = require("../models/Hostelers");
const axios= require("axios")
const sendSMS = require("../utils/sendSMS");
const formatDate = require("../utils/formatDate");

const dotenv = require("dotenv");
dotenv.config();

const OUTGOING_TEMPLATE_ID = process.env.OUTGOING_TEMPLATE_ID;
const RETURN_TEMPLATE_ID = process.env.RETURN_TEMPLATE_ID;
const OUTGOING_MSG=process.env.OUTGOING_MSG;
const RETURN_MSG=process.env.RETURN_MSG
exports.createRequest = async (req, res) => {
  try {    

    const newRequest = new Request(req.body);
  
    await newRequest.save();
    res.status(201).json({ success: "true" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REQUESTS OPERATIONS

// Approve a request
exports.approveRequest = async (req, res) => {
  try {
    const updatedRequest = await Request.findOneAndUpdate(
      { id: req.params.Id },
      req.body,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Find the hosteler related to the request
    const hosteler = await Hosteler.findOne({ rollNo: updatedRequest.rollNo });

    if (hosteler.lastRequest.status === "ACCEPTED") {
      if (hosteler) {
        const phoneNumber = hosteler.parentPhoneNo;
        let messageTemplate = OUTGOING_MSG;
        let variables = [];

        // Determine gender based on request ID prefix (BH for boys, GH for girls)
        const gender = updatedRequest.id.startsWith("BH")
          ? "అబ్బాయి"
          : "అమ్మాయి";

        // Translate the hosteler's name to Telugu
        const teluguNameResponse = await axios.get(
          `https://api.mymemory.translated.net/get?q=${hosteler.name}&langpair=en|te`
        );
        const teluguName = teluguNameResponse.data.responseData.translatedText;

        if (updatedRequest.type === "PERMISSION") {
          variables = [
            gender,
            teluguName,
            formatDate.formatDate(updatedRequest.date),
            formatDate.formatTime(updatedRequest.fromTime),
            formatDate.formatDate(updatedRequest.date),
            formatDate.formatTime(updatedRequest.toTime),
          ];
        } else if (updatedRequest.type === "LEAVE") {
          variables = [
            gender,
            teluguName,
            formatDate.formatDate(updatedRequest.fromDate),
            formatDate.formatTime(updatedRequest.fromDate),
            formatDate.formatDate(updatedRequest.toDate),
            formatDate.formatTime(updatedRequest.toDate),
          ];
        }

        // Send SMS notification
        await sendSMS(
          phoneNumber,
          OUTGOING_TEMPLATE_ID,
          messageTemplate,
          variables
        );

        return res
          .status(200)
          .json({ updated: true, message: "Notified to parent" });
      } else {
        return res.status(404).json({ message: "Hosteler not found" });
      }
    } else if (hosteler.lastRequest.status === "REJECTED") {
      return res
        .status(200)
        .json({ updated: true, message: "Notified to parent" });
    }
  } catch (error) {
    console.error("Error approving request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// Mark request as arrived
exports.arriveRequest = async (req, res) => {
  try {
    const updatedRequest = await Request.findOneAndUpdate(
      { id: req.params.Id },
      req.body,
      { new: true }
    );
    // console.log(updatedRequest);
    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const hosteler = await Hosteler.findOne({ rollNo: updatedRequest.rollNo });
    if (hosteler) {
      const phoneNumber = hosteler.parentPhoneNo;
      const messageTemplate = RETURN_MSG;

      // Determine gender based on hostel type
      const gender = updatedRequest.id.startsWith("BH") ? "అబ్బాయి" : "అమ్మాయి";

      teluguName = await axios.get(
        `https://api.mymemory.translated.net/get?q=${hosteler.name}&langpair=en|te`
      );
      // console.log(teluguName);
      // console.log(teluguName.data.responseData.translatedText);
      const variables = [
        gender,
        teluguName.data.responseData.translatedText,
        formatDate.formatDate(updatedRequest.arrived.time),
        formatDate.formatTime(updatedRequest.arrived.time),
      ];

      await sendSMS(
        phoneNumber,
        RETURN_TEMPLATE_ID,
        messageTemplate,
        variables
      );
      return res
        .status(200)
        .json({ updated: true, message: "notified to parent" });
    } else {
      return res.status(404).send("Hosteler not found");
    }
  } catch (error) {
    // console.error("Error approving request:", error);
    return res.json({ message: "Server error" });
  }
};


// Update a request by ID
exports.updateRequestById = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// GET SECTION
exports.getAllRequestsByRollNumber = async (req, res) => {
  try {
    const rollno = req.params.RollNo;
    const requests = await Request.find({ rollNo: rollno }).sort({
      createdAt: -1,
    });
    // console.log(requests);
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending requests(requestes that should be seen by incharge to accept or reject)
exports.getPendingRequestsByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;
    let pendingRequests;
    if (hostelId.toUpperCase() == "ALL") {
      // Fetch all requests with status 'submitted'
      pendingRequests = await Request.find({
        status: "SUBMITTED",
        isActive: true,
      });
    } else {
      // Fetch all requests with status 'submitted' for the given hostelId
      pendingRequests = await Request.find({
        hostelId: hostelId,
        status: "SUBMITTED",
        isActive: true,
      });
    }
    // console.log(pendingRequests);
    if (pendingRequests.length === 0) {
      return res.json({
        message: "No pending requests found for this hostel ID.",
      });
    }

    res.status(200).json(pendingRequests);
  } catch (error) {
    // console.error("Error fetching pending requests:", error);
    res.json({ message: "Server error. Please try again later." });
  }
};
// Get all approved requests that have not been returned, filtered by hostelid
exports.acceptedRequestsByhostelId = async (req, res) => {
  let requests;
  try {
    if (req.params.hostelId.toUpperCase() == "ALL") {
      requests = await Request.find({
        status: "ACCEPTED",
        isActive: true,
      }).sort({ createdAt: -1 });
    } else {
      requests = await Request.find({
        hostelId: req.params.hostelId,
        status: "ACCEPTED",
        isActive: true,
      }).sort({ createdAt: -1 });
    }
    res.status(200).json(requests);
  } catch (error) {
    // console.error("Error fetching not returned requests:", error);
    res.send("Server error");
  }
};

// Get all arrived requests between two dates
exports.getArrivedRequestsBetweenDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log(startDate);
    console.log(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.json({ message: "Invalid date format" });
    }
    let requests;
    if (req.params.hostelId.toUpperCase() == "ALL") {
      // Find all requests where 'arrived.time' is between startDate and endDate
      requests = await Request.find({
        arrived: { $ne: null }, // Ensure 'arrived' is not null
        "arrived.time": { $gte: start, $lte: end },
      }).sort({ "arrived.time": -1 });
    } else {
      // Find all requests where 'arrived.time' is between startDate and endDate
      requests = await Request.find({
        hostelId: req.params.hostelId,
        arrived: { $ne: null }, // Ensure 'arrived' is not null
        "arrived.time": { $gte: start, $lte: end },
      }).sort({ "arrived.time": -1 });
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching arrived requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all accepted requests between two dates
exports.getAcceptedRequestsBetweenDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Ensure dates are provided and valid
    if (!startDate || !endDate) {
      return res.json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if the provided dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.json({ message: "Invalid date format" });
    }

    let requests;

    if (req.params.hostelId.toUpperCase() == "ALL") {
      // Find all requests where 'accepted.time' is between startDate and endDate
      requests = await Request.find({
        accepted: { $ne: null }, // Ensure 'accepted' is not null
        "accepted.time": { $gte: start, $lte: end },
      }).sort({ "accepted.time": -1 });
    } else {
      // Find all requests where 'accepted.time' is between startDate and endDate and match hostelId
      requests = await Request.find({
        hostelId: req.params.hostelId,
        accepted: { $ne: null }, // Ensure 'accepted' is not null
        "accepted.time": { $gte: start, $lte: end },
      }).sort({ "accepted.time": -1 });
    }

    // Send the filtered requests in response
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching accepted requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE SECTION
// Delete a request by ID
exports.deleteRequestById = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a request by ROLLNO
exports.deleteRequestByRollNo = async ({ params }) => {
  try {
    const { rollNo } = params;
    const request = await Request.deleteMany({ rollNo: rollNo });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//REQUEST COUNTS

const moment = require("moment"); // For date manipulation

//today total requests
exports.getTodayRequestCounts = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    // Count total requests for today
    const totalRequests = await Request.countDocuments({
      date: { $gte: today, $lte: endOfDay },
      status: "ACCEPTED",
    });

    // Count requests based on type for today
    const typeCounts = await Request.aggregate([
      {
        $match: {
          date: { $gte: today, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the aggregation result into a more readable format
    const counts = {
      total: totalRequests,
      permission: 0,
      leave: 0,
    };

    typeCounts.forEach((type) => {
      if (type._id === "PERMISSION") counts.permission = type.count;
      else if (type._id === "LEAVE") counts.leave = type.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//TODAY TOTAL REQUESTS by hostelid
exports.getTodayRequestCountsByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params; // Get hostelId from request parameters

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID is required" });
    }

    // Get today's date in YYYY-MM-DD format
    const today = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    // Count total requests for today based on hostelId
    const totalRequests = await Request.countDocuments({
      hostelId,
      date: { $gte: today, $lte: endOfDay },
    });

    // Count requests based on type for today and hostelId
    const typeCounts = await Request.aggregate([
      {
        $match: {
          hostelId,
          date: { $gte: today, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the aggregation result into a more readable format
    const counts = {
      total: totalRequests,
      permission: 0,
      leave: 0,
      permisssionArray: [],
      leaveArray: [],
    };

    typeCounts.forEach((type) => {
      if (type._id === "PERMISSION") counts.permission = type.count;
      else if (type._id === "LEAVE") counts.leave = type.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get today's accepted requests
exports.getTodayAcceptedByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID is required" });
    }

    const today = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const totalRequests = await Request.countDocuments({
      hostelId,
      "accepted.time": { $gte: today, $lte: endOfDay },
    });

    const typeCounts = await Request.aggregate([
      {
        $match: {
          hostelId,
          "accepted.time": { $gte: today, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          requests: { $push: "$$ROOT" },
        },
      },
    ]);

    const counts = {
      total: totalRequests,
      permission: 0,
      leave: 0,
      permissionArray: [],
      leaveArray: [],
    };

    typeCounts.forEach((type) => {
      if (type._id === "PERMISSION") {
        counts.permission = type.count;
        counts.permissionArray = type.requests;
      } else if (type._id === "LEAVE") {
        counts.leave = type.count;
        counts.leaveArray = type.requests;
      }
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get today's arrived requests
exports.getTodayArrivedByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID is required" });
    }

    const today = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const totalRequests = await Request.countDocuments({
      hostelId,
      "arrived.time": { $gte: today, $lte: endOfDay },
    });

    const typeCounts = await Request.aggregate([
      {
        $match: {
          hostelId,
          "arrived.time": { $gte: today, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          requests: { $push: "$$ROOT" },
        },
      },
    ]);

    const counts = {
      total: totalRequests,
      permission: 0,
      leave: 0,
      permissionArray: [],
      leaveArray: [],
    };

    typeCounts.forEach((type) => {
      if (type._id === "PERMISSION") {
        counts.permission = type.count;
        counts.permissionArray = type.requests;
      } else if (type._id === "LEAVE") {
        counts.leave = type.count;
        counts.leaveArray = type.requests;
      }
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
