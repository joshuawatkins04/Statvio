const multer = require("multer");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const s3Client = require("../../config/awsConfig");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../../config/logger");
require("dotenv").config();

const bucketName = process.env.S3_BUCKET_NAME;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    logger.warn("[aws - multer] Invalid file type rejected.", {
      fileName: file.originalname,
      mimeType: file.mimetype,
    });
    cb(new Error("Only .jpeg, .jpg, and .png files allowed."));
  },
});

const uploadToS3 = async (file, userId) => {
  const extension = file.originalname.split(".").pop();
  const fileName = `${userId}-${uuidv4()}.${extension}`;

  try {
    logger.info("[aws - uploadToS3] Starting file upload to S3.", {
      fileName,
      userId,
      bucketName,
    });

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();
    const fileUrl =
      result.Location || `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    logger.info("[aws - uploadToS3] File uploaded successfully.", {
      fileKey: fileName,
      fileUrl,
    });

    return {
      fileKey: fileName,
      fileUrl,
    };
  } catch (error) {
    logger.error("[aws - uploadToS3] Error during file upload.", {
      error: error.message,
      stack: error.stack,
    });
    throw new Error("File upload failed. Please try again.");
  }
};

const deleteFromS3 = async (key) => {
  try {
    logger.info("[aws - deleteFromS3] Starting file deletion from S3.", {
      fileKey: key,
      bucketName,
    });

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    logger.info("[aws - deleteFromS3] File deleted successfully.", { fileKey: key });
    return response;
  } catch (error) {
    logger.error("[aws - deleteFromS3] Error during file deletion.", {
      error: error.message,
      stack: error.stack,
      fileKey: key,
    });
    throw new Error("File deletion failed. Please try again.");
  }
};

module.exports = { upload, uploadToS3, deleteFromS3 };
