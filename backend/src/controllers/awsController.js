const { uploadToS3 } = require("../services/aws/aws");
const User = require("../models/userModel");

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const imageUrl = await uploadToS3(req.file);
    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true });
    res.status(200).json({ imageUrl: updatedUser.profileImage });
  } catch (error) {
    console.error("[awsController - upload] ERROR:", error.message);
    res.status(500).json({ error: "Failed to upload file." });
  }
};

module.exports = { upload };
