// controllers/hostelerController.js
const Hosteler = require('../models/Hostelers');
const HostlerCredentials = require('../models/HostlerCredentials');
const Request = require('../models/Requests');
const { forgotPassword } = require('./hostlerCredentialsController'); 


// CREATE SECTION
// Create a new hosteler
exports.createHosteler = async (req, res) => {
    try {
        const { rollNo } = req.body;

        // Check if the hosteler already exists by rollNo
        const existingHosteler = await Hosteler.findOne({ rollNo });
        if (existingHosteler) {
            return res.json({ isExisted: true, success: false, message: `Hosteler with roll number ${rollNo} already exists.` });
        }

        // Create the hosteler
        const hosteler = new Hosteler(req.body);
        await hosteler.save();

        // Respond with the created hosteler
        res.status(201).json({ isExisted: false, success: true, message:"Student Added Successfully!" });
    } catch (error) {
        res.json({ isExisted:false,success: false, message: error.message });
    }
};


// VERIFY SECTION
// Verify a student and trigger forgot password functionality
exports.verifyStudent = async (req, res) => {
    try {
        // Check if the student exists
        const hosteler = await Hosteler.findOne({ rollNo:req.params.RollNo });

        if (!hosteler) {
            return res.json({isExist:false,phoneNo:'', message: 'Hosteler not found' });
        }

        // If the student exists, call the forgotPassword function
        // Pass the hosteler object which includes phone number
        const {phoneNo,otp} = await forgotPassword(hosteler);

        res.status(200).json({ isExist:true,phoneNo, message: 'Forgot password process initiated. OTP sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyRegisterStudent = async (req,res) =>{
    try {
        const hosteler = await Hosteler.findOne({ rollNo: req.params.RollNo });
        
        if (!hosteler) {
            return res.json({isExist:false,isRegistered:false, message: 'Hosteler not found' });
        }
        
        if(hosteler.lastRequest){
            return res.json({isExist:true,isRegistered:true, message: 'Hosteler already Registered' });
        }

        const hostlerCredentials = await HostlerCredentials.findOne({ rollNo: req.params.RollNo });
        if(hostlerCredentials){
            return res.json({isExist:true,isRegistered:true, message: 'Hosteler already Registered' });
        }
        res.status(200).json({isExist:true,isRegistered:false,hosteler});
    } catch (error) {
        res.json({ message: error.message });
    }

}


// GET SECTION
// Get all hostelers
exports.getAllHostelers = async (req, res) => {
    
    try {
        const hostelers = await Hosteler.find();
        res.status(200).json(hostelers);
    } catch (error) {
        res.json({ message: error.message });
    }
};

// Get a single hosteler by RollNo
exports.getHostelerByRollNo = async (req, res) => {
    try {
        const hosteler = await Hosteler.findOne({ rollNo: req.params.RollNo });
        
        if (!hosteler) {
            return res.json({isExist:false, message: 'Hosteler not found' });
        }
        res.status(200).json({isExist:true,hosteler});
    } catch (error) {
        res.json({ message: error.message });
    }
};

// Get hostlers by filter criteria
exports.getFilteredHostlers = async (req, res) => {
    try {
        const { hostelId, college, year, branch } = req.body;

        let filter = {};

        if (hostelId && hostelId.toUpperCase() !== "ALL") filter.hostelId = hostelId;
        if (college && college.toUpperCase() !== "ALL") filter.college = college;
        if (year && year.toUpperCase() !== "ALL") filter.year = parseInt(year);
        if (branch && branch.toUpperCase() !== "ALL") filter.branch = branch;

        // console.log(filter);

        const hostlers = await Hosteler.find(filter);

        res.status(200).json(hostlers);
    } catch (error) {
        console.error("Error fetching filtered hostlers:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Get total count of hostlers and count based on currentStatus
exports.getHostelerCounts = async (req, res) => {
    try {
        const totalHostlers = await Hosteler.countDocuments();

        const statusCounts = await Hosteler.aggregate([
            {
                $group: {
                    _id: "$currentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            total: totalHostlers,
            hostel: 0,
            permission: 0,
            leave: 0
        };

        statusCounts.forEach(status => {
            if (status._id === "HOSTEL") counts.hostel = status.count;
            else if (status._id === "PERMISSION") counts.permission = status.count;
            else if (status._id === "LEAVE") counts.leave = status.count;
        });

        res.status(200).json(counts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get hostlers by hostelId
exports.getHostelersByHostelId = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const hostelers = await Hosteler.find({ hostelId });
        if (!hostelers.length) {
            return res.status(404).json({ message: 'No hostlers found for this hostelId' });
        }
        res.status(200).json(hostelers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get count based on hostelId and currentStatus
exports.getHostelerCountsByHostelId = async (req, res) => {
    try {
        const { hostelId } = req.params;

        const totalHostlers = await Hosteler.countDocuments({ hostelId });
        // Count based on currentStatus for the given hostelId
        const statusCounts = await Hosteler.aggregate([
            { $match: { hostelId } }, // Filter by hostelId
            {
                $group: {
                    _id: "$currentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Convert the aggregation result into a more readable format
        const counts = {
            total: totalHostlers,
            hostel: 0,
            permission: 0,
            leave: 0
        };
        statusCounts.forEach(status => {
            if (status._id === "HOSTEL") counts.hostel = status.count;
            else if (status._id === "PERMISSION") counts.permission = status.count;
            else if (status._id === "LEAVE") counts.leave = status.count;
        });
        res.status(200).json(counts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get count of studnets of differnt colleges based on HostelId
exports.getHostelerCountsByCollege = async (req, res) => {
  try {
    const { hostelId } = req.params;

    // Aggregating hostlers by college and year for the given hostelId
    const hostelerCounts = await Hosteler.aggregate([
      { $match: { hostelId } }, // Filter by hostelId
      {
        $group: {
          _id: {
            college: "$college", // Group by college
            year: "$year", // Group by year within each college
          },
          count: { $sum: 1 }, // Count the number of hostlers
        },
      },
      {
        $group: {
          _id: "$_id.college", // Group results by college
          years: {
            $push: {
              year: "$_id.year",
              count: "$count",
            },
          },
        },
      },
    ]);

    const counts = {};

    // Ensure each college has the correct structure for I-IVYear (or V-VIYear if necessary)
    hostelerCounts.forEach((collegeGroup) => {
      const collegeName = collegeGroup._id;

      // If college is 'NIPS', ensure that the structure has exactly I to VIYear
      if (collegeName === "NIPS") {
        counts[collegeName] = {
          IYear: 0,
          IIYear: 0,
          IIIYear: 0,
          IVYear: 0,
          VYear: 0,
          VIYear: 0,
        };

        collegeGroup.years.forEach((yearGroup) => {
          const year = yearGroup.year;
          const count = yearGroup.count;

          if (year === 1) counts[collegeName].IYear = count;
          else if (year === 2) counts[collegeName].IIYear = count;
          else if (year === 3) counts[collegeName].IIIYear = count;
          else if (year === 4) counts[collegeName].IVYear = count;
          else if (year === 5) counts[collegeName].VYear = count;
          else if (year === 6) counts[collegeName].VIYear = count;
        });
      } else {
        // For other colleges, structure based on I-IVYear
        counts[collegeName] = {
          IYear: 0,
          IIYear: 0,
          IIIYear: 0,
          IVYear: 0,
        };

        collegeGroup.years.forEach((yearGroup) => {
          const year = yearGroup.year;
          const count = yearGroup.count;

          if (year === 1) counts[collegeName].IYear = count;
          else if (year === 2) counts[collegeName].IIYear = count;
          else if (year === 3) counts[collegeName].IIIYear = count;
          else if (year === 4) counts[collegeName].IVYear = count;
        });
      }
    });

    // Ensure NIPS is in the response even if it's not in the data
    if (!counts.NIPS) {
      counts.NIPS = {
        IYear: 0,
        IIYear: 0,
        IIIYear: 0,
        IVYear: 0,
        VYear: 0,
        VIYear: 0,
      };
    }

    // Send the formatted response
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE SECTION
// Update a hosteler by RollNo
exports.updateHostelerByRollNo = async (req, res) => {
    try {        
        const updateFields = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value !== null && value !== undefined) {
                updateFields[key] = value;
            }
        }
        const hosteler = await Hosteler.findOneAndUpdate({ rollNo: req.params.RollNo }, updateFields, { new: true });

        if (!hosteler) {
            return res.status(404).json({ message: 'Hosteler not found' });
        }

        res.status(200).json({ updated: true, data: hosteler });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update filtered hostelers by incrementing their year by 1
exports.updateFilteredHostlers = async (req, res) => {
  try {
    const { rollNumbers, year } = req.body;

    // Validate input
    if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) {
      return res.status(400).json({
        isUpdated: false,
        message:
          "Invalid roll numbers. Please provide a non-empty array of roll numbers.",
      });
    }

    if (!year || isNaN(parseInt(year))) {
      return res.status(400).json({
        isUpdated: false,
        message: "Invalid year. Please provide a valid year value.",
      });
    }

    // Update all hostelers with matching roll numbers by setting the year to the specified value
    const updateResult = await Hosteler.updateMany(
      { rollNo: { $in: rollNumbers } },
      { $set: { year: parseInt(year) } }
    );

    // Check if any hostelers were updated
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        isUpdated: false,
        message: "No hostelers found with the provided roll numbers.",
      });
    }

    // Return the update result
    res.status(200).json({
      isUpdated: true,
      message: `${updateResult.modifiedCount} students year updated to ${year} year.`,
    });
  } catch (error) {
    console.error("Error updating hostelers by roll numbers:", error);
    res.status(500).json({
      isUpdated: false,
      message: "Server error. Please try again later.",
    });
  }
};





// DELETE SECTION

const { deleteHostler } =require('./hostlerCredentialsController')
// Delete a hosteler by RollNo
exports.deleteHostelerByRollNo = async (req, res) => {
    try {
        // console.log(req.params.RollNo)
        const rollNo  = req.params.RollNo;
        const deleteRequestsResult = await Request.deleteMany({ rollNo:rollNo });
        
        const hosteler = await Hosteler.findOneAndDelete({ rollNo: rollNo });

        if (!hosteler) {
            return res.json({ message: 'Hosteler not found' });
        }

        // delete the hosteler's credentials
        const deleteStudentLogin = await deleteHostler({ params: { rollNo: rollNo } });

        res.status(200).json({ deleted: true, message: 'Student Data Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete hostelers by a list of roll numbers
exports.deleteFilteredHostlers = async (req, res) => {
  try {
    const { rollNumbers } = req.body; 
    if (
      !rollNumbers ||
      !Array.isArray(rollNumbers) ||
      rollNumbers.length === 0
    ) {
      return res
        .status(400)
        .json({
          isDeleted: false,
          message: "A valid list of roll numbers is required",
        });
    }
    // console.log("Roll numbers for deletion:", rollNumbers);

    // Find all hostelers matching the roll numbers
    const hostelersToDelete = await Hosteler.find({
      rollNo: { $in: rollNumbers },
    });

    if (hostelersToDelete.length === 0) {
      return res.status(404).json({
        isDeleted: false,
        message: "No hostelers found with the provided roll numbers.",
      });
    }

    // Loop through each hosteler and delete associated data
    for (const hosteler of hostelersToDelete) {
      const rollNo = hosteler.rollNo;
      // console.log(`Deleting hosteler with roll number: ${rollNo}`);

      const deleteRequestsResult = await Request.deleteMany({ rollNo });

      // Delete hosteler credentials
      const deleteStudentLogin = await deleteHostler({ params: { rollNo } });
      // console.log(`Deleted credentials for hosteler with rollNo: ${rollNo}`);
      await Hosteler.findOneAndDelete({ rollNo });
      // console.log(`Deleted hosteler with rollNo: ${rollNo}`);
    }

    res.status(200).json({
      isDeleted: true,
      message: `${hostelersToDelete.length} students deleted.`,
    });
  } catch (error) {
    console.error("Error deleting filtered hostelers:", error);
    res
      .status(500)
      .json({
        isDeleted: false,
        message: "Server error. Please try again later.",
      });
  }
};

