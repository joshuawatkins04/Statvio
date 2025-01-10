const { uploadToS3, deleteFromS3 } = require("../services/aws/aws");
const User = require("../models/user");

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    if (!req.user || !req.user.id) {
      console.error("[awsController - upload] ERROR: req.user or req.user.id is not defined");
      return res.status(401).json({ error: "Unauthorized: User not found in token." });
    }

    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const user = await User.findById(userId);
    if (!user) {
      console.error("[awsController - upload] ERROR: User not found in database.");
      return res.status(404).json({ error: "User not found." });
    }
    const { fileKey, fileUrl } = await uploadToS3(req.file, userId);
    if (user.profileImageKey) {
      try {
        await deleteFromS3(user.profileImageKey);
      } catch (error) {
        console.error("Failed to delete old image from S3:", error);
      }
    }
    user.profileImageKey = fileKey;
    user.profileImageUrl = fileUrl;
    await user.save();
    res.status(200).json({ imageUrl: fileUrl });
  } catch (error) {
    console.error("[awsController - upload] ERROR:", error.message);
    res.status(500).json({ error: "Failed to upload file." });
  }
};

module.exports = { upload };
