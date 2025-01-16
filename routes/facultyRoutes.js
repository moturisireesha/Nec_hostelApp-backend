// routes/facultyRoutes.js
const express = require("express");
const router = express.Router();
const FacultyController = require('../controllers/FacultyController')


router.post("/add", FacultyController.createFaculty);
router.get("/get", FacultyController.getFaculty);
router.put("/update", FacultyController.updateFaculty);
router.post("/login",FacultyController.login)

module.exports = router;
