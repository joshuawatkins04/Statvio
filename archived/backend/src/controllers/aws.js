const { uploadToS3, deleteFromS3 } = require("../services/aws/aws");
const User = require("../models/user");
const logger = require("../config/logger");

const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const userId = req.user?.id;
    if (!userId) {
      logger.error("[awsController - upload] ERROR: Unauthorized access, user not found in token.");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findById(userId);
    if (!user) {
      logger.error("[awsController - upload] ERROR: User not found in the database.", { userId });
      return res.status(404).json({ error: "User not found." });
    }

    const { fileKey, fileUrl } = await uploadToS3(req.file, userId);
    logger.info("[awsController - upload] INFO: File uploaded to S3.", { fileKey, fileUrl });

    if (user.profileImageKey) {
      try {
        await deleteFromS3(user.profileImageKey);
        logger.info("Old profile image deleted from S3.", { oldFileKey: user.profileImageKey });
      } catch (error) {
        logger.error("[awsController - upload] ERROR: Failed to delete old image from S3.", {
          error: error.message,
          oldFileKey: user.profileImageKey,
        });
      }
    }
    user.profileImageKey = fileKey;
    user.profileImageUrl = fileUrl;
    await user.save();
    logger.info("[awsController - upload] INFO: User profile image updated in database.", {
      userId,
      fileKey,
      fileUrl,
    });
    res.status(200).json({ imageUrl: fileUrl });
  } catch (error) {
    logger.error("[awsController - upload] ERROR: Failed to upload file.", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to upload file." });
  }
};

module.exports = { upload };
