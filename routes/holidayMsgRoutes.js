const express = require("express");
const router = express.Router();
const holidayMsgController = require("../controllers/HolidayMsgController");

// Routes for CRUD operations
router.post("/create", holidayMsgController.createHolidayMsg);
router.get("/all", holidayMsgController.getHolidayMsgs);
router.delete("/delete/:id", holidayMsgController.deleteHolidayMsg);

// Route to send holiday messages
router.post("/send", holidayMsgController.sendHolidayMsgs);

module.exports = router;
