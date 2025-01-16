const express = require('express');
const multer = require('multer');
const path = require('path');
const { addHostelers } = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'file-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route to handle file upload
router.post('/addStudents',addHostelers ); //upload array of students details

module.exports = router;
