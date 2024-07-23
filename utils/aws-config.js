const { S3Client } = require("@aws-sdk/client-s3");

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION, // Ensure this environment variable is set correctly
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;
