const multer = require("multer");
const sharp = require("sharp");
const {
    S3Client,
    DeleteObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsUrl = process.env.AWS_BASE_URL;

const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    endpoint: awsUrl,
    forcePathStyle: true
});

const deleteObjS3 = async (key) => {
    let fileName = key?.startsWith(awsUrl) ? key.replace(`${awsUrl}/${bucketName}/`, "") : key;
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    try {
        await s3Client.send(command);
    } catch (err) {
        console.error(err);
    }
};

const fileFilter = (req, file, cb) => {
    file.mimetype.startsWith("image/")
        ? cb(null, true)
        : cb(new Error("Only image files are allowed!"), false);
};

const uploadToS3 = async (buffer, originalName) => {
    const extension = originalName.split(".").pop();
    const filenameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
    const sanitizedFilename = filenameWithoutExtension.replace(
        /[^a-zA-Z0-9]/g,
        ""
    );
    const sanitizedFileNameWithExtension = `${Date.now()}${sanitizedFilename}.${extension}`;

    const params = {
        Bucket: bucketName,
        Key: sanitizedFileNameWithExtension,
        Body: buffer,
        ContentType: `image/${extension}`,
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(params));
        const location = `${awsUrl}/${bucketName}/${sanitizedFileNameWithExtension}`;
        return { ...data, Key: params.Key, Location: location };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const customStorage = {
    _handleFile: (req, file, cb) => {
        const chunks = [];
        file.stream.on("data", (chunk) => chunks.push(chunk));
        file.stream.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            const mimeType = file.mimetype;

            try {
                let processedBuffer = buffer;
                if (mimeType.startsWith("image/")) {
                    const image = sharp(buffer);
                    if (mimeType === "image/jpeg" || mimeType === "image/jpg")
                        processedBuffer = await image.jpeg({ quality: 60 }).toBuffer();
                    else if (mimeType === "image/png")
                        processedBuffer = await image.png({ quality: 60 }).toBuffer();
                    else if (mimeType === "image/webp")
                        processedBuffer = await image.webp({ quality: 60 }).toBuffer();
                    else if (mimeType === "image/gif")
                        processedBuffer = await image.gif({ quality: 60 }).toBuffer();
                }

                const result = await uploadToS3(processedBuffer, file.originalname);
                cb(null, { key: result.Key, location: result.Location });
            } catch (err) {
                cb(err);
            }
        });
    },
    _removeFile: (req, file, cb) => cb(null),
};

const upload = multer({
    storage: customStorage,
    fileFilter: fileFilter,
});
module.exports = { upload, deleteObjS3 };
