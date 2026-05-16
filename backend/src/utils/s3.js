const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (fileBuffer, fileName, mimetype) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return fileName;
};

const deleteFile = async (fileName) => {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
};

const getObjectSignedUrl = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const seconds = 3600; // 1 hour
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url;
};

module.exports = {
  uploadFile,
  deleteFile,
  getObjectSignedUrl,
  s3Client
};
