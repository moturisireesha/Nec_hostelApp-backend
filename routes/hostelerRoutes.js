// routes/hostelerRoutes.js
const express = require('express');
const router = express.Router();
const hostelerController = require('../controllers/hostelerController');

router.post('/create', hostelerController.createHosteler); // adding student details through admin
router.get('/verify/:RollNo',hostelerController.verifyStudent) //it is used  in forgot password to verify student
router.get('/register/:RollNo',hostelerController.verifyRegisterStudent) //verifying student exist or not in regestration
router.get('/:RollNo', hostelerController.getHostelerByRollNo);//get student details by RollNo 
router.post('/getAll', hostelerController.getFilteredHostlers);//get all students data by taking hostelid,clg,year,branch


router.put('/update/:RollNo', hostelerController.updateHostelerByRollNo);//Update student details or last request
router.put('/updateMany',hostelerController.updateFilteredHostlers) // update selceted students academic year

router.delete('/delete/:RollNo', hostelerController.deleteHostelerByRollNo); //Delete student details
router.delete("/deleteMany", hostelerController.deleteFilteredHostlers); //Delete filtered student

router.get('/get/counts/:hostelId', hostelerController.getHostelerCountsByHostelId); //get no.of students in particular hostel
router.get('/get/countsByClg/:hostelId',hostelerController.getHostelerCountsByCollege); //get no.of students from each clg in year wise


// router.get('/', hostelerController.getAllHostelers);
// router.get('/get/counts', hostelerController.getHostelerCounts);

module.exports = router;
