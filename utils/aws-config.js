const { S3Client } = require("@aws-sdk/client-s3");

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  endpoint: process.env.AWS_BASE_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true
});

module.exports = s3;
