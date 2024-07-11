const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to convert PDF to base64
const convertPdfToBase64 = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Convert the PDF buffer to a base64 string
  const base64String = `data:application/pdf;base64,${req.file.buffer.toString(
    "base64"
  )}`;

  // Attach the base64 string to the request body
  req.body.cvBase64 = base64String;

  next();
};

module.exports = { upload, convertPdfToBase64 };
