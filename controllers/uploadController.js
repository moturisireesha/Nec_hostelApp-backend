const mongoose = require("mongoose");
const Hosteler = require("../models/Hostelers");

// Helper function to convert date strings to ISO format
const convertDate = (dateString) => {
  const [day, month, year] = dateString.split("-");
  return new Date(`${year}-${month}-${day}`);
};

// add  Hostlers data through excel file
exports.addHostelers = async (req, res) => {
  // console.log(req.body)
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).send("Invalid data format or empty array.");
  }

  const jsonData = req.body;

  // Filter out records with null or missing RollNo
  const validData = jsonData.filter((data) => data.rollNo != null);

  // Process each record
  const processedData = validData.map((data) => {
    // Convert date if present
    if (data.dob) {
      try {
        data.dob = convertDate(data.dob);
      } catch (error) {
        console.error(`Error converting date: ${data.dob}`);
        data.dob = null; // Handle invalid dates appropriately
      }
    }

      // console.log(processedData);


    // Ensure field names match the schema
    return {
      hostelId: data.hostelId.toUpperCase(),
      rollNo: data.rollNo.toUpperCase(),
      name: data.name,
      college: data.college.toUpperCase(),
      year: data.year,
      branch: data.branch.toUpperCase(),
      gender: data.gender.toUpperCase(),
      dob: data.dob,
      phoneNo: data.phoneNo,
      email: data.email,
      parentName: data.parentName,
      parentPhoneNo: data.parentPhoneNo,
      currentStatus: data.currentStatus || "HOSTEL",
      requestCount: data.requestCount || 0,
      lastRequest: data.lastRequest || null,
    };
  });

  try {
    // Find existing rollNos
    const existingRollNos = await Hosteler.find({
      rollNo: { $in: processedData.map((data) => data.rollNo) },
    }).select("rollNo");

    // Create a set of existing rollNos for quick lookup
    const existingRollNoSet = new Set(
      existingRollNos.map((hosteler) => hosteler.rollNo)
    );

    // Filter out data with existing rollNos
    const uniqueData = processedData.filter(
      (data) => !existingRollNoSet.has(data.rollNo)
    );

    console.log("uniqueData")
    console.log(uniqueData.length);
    console.log(uniqueData)

    // Insert only the unique records
    const result = await Hosteler.insertMany(uniqueData, { ordered: false }); // Use ordered: false to continue on duplicate errors
    // console.log(result)
    res.status(200).send({added:true,message:`${result.length} records inserted successfully`});
  } catch (err) {
    console.error("Error inserting data: ", err);
    res.status(500).send("Error inserting data");
  }
};
