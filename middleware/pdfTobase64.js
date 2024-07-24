const multer = require("multer");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/aws-config"); // Adjust the path if needed

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to convert PDF to Base64 and upload to S3
const convertPdfToBase64 = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Ensure the uploaded file is a PDF
  if (path.extname(req.file.originalname) !== ".pdf") {
    return res.status(400).send("File is not a PDF");
  }

  // Upload PDF to S3
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your bucket name
    Key: `resumes/${req.file.originalname}`, // File name you want to save as in S3
    Body: req.file.buffer,
    ContentType: "application/pdf",
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    req.body.cvBase64 = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/resumes/${req.file.originalname}`; // Construct the S3 URL
    req.body.fileName = req.file.originalname;
    next();
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send("Error uploading file");
  }
};

// Middleware to upload image to S3
const uploadImageToS3 = async (req, res, next) => {
  // Upload image to S3
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your bucket name
    Key: `images/${req.file.originalname}`, // File name you want to save as in S3
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    req.body.imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/images/${req.file.originalname}`; // Construct the S3 URL
    req.body.fileName = req.file.originalname;
    next();
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send("Error uploading file");
  }
};

module.exports = { upload, convertPdfToBase64, uploadImageToS3 };
