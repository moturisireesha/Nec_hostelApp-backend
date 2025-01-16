const express = require('express');
const router = express.Router();
const inchargeController = require('../controllers/inchargeController');

// CRUD operations for incharges
router.post('/create', inchargeController.createIncharge); //Adding new Incharge 
router.get('/verify/:eid',inchargeController.verifyIncharge)//verify incharge in forgot password
router.get('/getAll', inchargeController.getAllIncharges); //Getting all Incharges
router.get('/getIncharges/:hostelId',inchargeController.getInchargesByHostelId); //Getting Incharges by hostelID
router.get('/:eid', inchargeController.getInchargeByEid); //get Incharge Details by empId
router.put('/update/:eid', inchargeController.updateInchargeByEid); //update incharge details
router.delete('/delete/:eid', inchargeController.deleteInchargeByEid); //delete incharge details

module.exports = router;
