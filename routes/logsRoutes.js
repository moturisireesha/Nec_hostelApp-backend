const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logsController");

// Route to add a new log
router.post("/add-log", logsController.addLog); //add the log 

// Route to get logs by date (date format: YYYY-MM-DD)
router.post("/getLogs", logsController.getLogsByDate); // get logs based on selected date
router.delete("/delete-logs",logsController.deleteOldLogs)

module.exports = router;
