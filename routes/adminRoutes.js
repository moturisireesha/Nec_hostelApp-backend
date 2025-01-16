// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post("/add-admin", adminController.createAdmin); // add admin details 
router.get('/getAdmin/:eid', adminController.getAdminByUsername);//get admin data after login
router.put('/update/:username', adminController.updateAdminByUsername); //update admin details by username
router.delete('/delete/:username', adminController.deleteAdminByUsername); //delete admin details by username
router.get('/verify/:eid',adminController.verifyAdmin) // verify admin in forgot password
router.get("/getAdmins", adminController.getAllAdmins); 
// router.post('/login',adminController.login); //admin Login


module.exports = router;