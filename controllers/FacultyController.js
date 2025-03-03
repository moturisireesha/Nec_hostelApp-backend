const Faculty = require("../models/Faculty");

// Create a new faculty (only one record allowed)
exports.createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty({
      username: req.body.username,
      password: req.body.password,
    });

    await faculty.save();
    res
      .status(201)
      .json({ success: true, message: "Faculty record created successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Read the single faculty record
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findOne();
    if (!faculty) {
      return res
        .status(404)
        .json({ success: false, message: "Faculty record not found." });
    }
    res.status(200).json({ faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update the single faculty record
exports.updateFaculty = async (req, res) => {
  try {
    const updatedFaculty = await Faculty.findOneAndUpdate(
      {},
      { username: req.body.username, password: req.body.password },
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      return res
        .status(404)
        .json({ success: false, message: "Faculty record not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Faculty record updated successfully.",
        
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Faculty login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const faculty = await Faculty.findOne({ username });

    if (!faculty) {
      return res.json({ success: false, message: "Faculty not found" });
    }

    if (password !== faculty.password) {
      return res.json({ success: false, message: "Invalid username or password" });
    }

    res.status(200).json({ success: true, message: "Successfully logged in",token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};