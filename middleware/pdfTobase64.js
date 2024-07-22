const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to convert PDF to Base64
const convertPdfToBase64 = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Ensure the uploaded file is a PDF
  if (path.extname(req.file.originalname) !== ".pdf") {
    return res.status(400).send("File is not a PDF");
  }

  // Convert the PDF buffer to a Base64 string
  const base64String = `data:application/pdf;base64,${req.file.buffer.toString(
    "base64"
  )}`;

  // Attach the Base64 string and file name to the request body
  req.body.cvBase64 = base64String;
  req.body.fileName = req.file.originalname;

  // Proceed to the next middleware
  next();
};

module.exports = { upload, convertPdfToBase64 };
