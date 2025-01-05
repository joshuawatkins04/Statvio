const multer = require("multer");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const s3Client = require("../../config/awsConfig");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
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
    cb(new Error("Only .jpeg, .jpg, and .png files allowed."));
  },
});

const uploadToS3 = async (file, userId) => {
  const extension = file.originalname.split(".").pop();
  const fileName = `${userId}-${uuidv4()}.${extension}`;

  try {
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

    return {
      fileKey: fileName,
      fileUrl:
        result.Location || `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
    };
  } catch (error) {
    console.error("[aws - uploadToS3] ERROR: upload error:", error);
    throw error;
  }
};

const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error("[aws - deleteFromS3] ERROR:", error);
    throw error;
  }
};

module.exports = { upload, uploadToS3, deleteFromS3 };
