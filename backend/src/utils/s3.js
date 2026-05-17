const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

let s3Client;

function getS3Config() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    const missing = [
      !region && 'AWS_REGION',
      !accessKeyId && 'AWS_ACCESS_KEY_ID',
      !secretAccessKey && 'AWS_SECRET_ACCESS_KEY',
      !bucket && 'AWS_BUCKET_NAME',
    ].filter(Boolean);

    const err = new Error(
      `AWS S3 is not configured. Set: ${missing.join(', ')}`
    );
    err.code = 'S3_NOT_CONFIGURED';
    throw err;
  }

  return { region, accessKeyId, secretAccessKey, bucket };
}

function getClient() {
  const { region, accessKeyId, secretAccessKey } = getS3Config();
  if (!s3Client) {
    s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

function mapAwsError(err) {
  const code = err.name || err.Code || err.code;

  switch (code) {
    case 'S3_NOT_CONFIGURED':
      return err.message;
    case 'InvalidAccessKeyId':
    case 'SignatureDoesNotMatch':
    case 'UnrecognizedClientException':
      return 'Invalid AWS credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.';
    case 'AccessDenied':
      return 'AWS denied upload. Grant the IAM user s3:PutObject, s3:GetObject, and s3:DeleteObject on the bucket.';
    case 'NoSuchBucket':
      return `S3 bucket "${process.env.AWS_BUCKET_NAME}" does not exist.`;
    case 'PermanentRedirect':
    case 'AuthorizationHeaderMalformed':
    case 'IllegalLocationConstraintException':
      return 'AWS region does not match the bucket. Set AWS_REGION to the bucket’s region.';
    default:
      return err.message || 'S3 operation failed';
  }
}

const uploadFile = async (fileBuffer, fileName, mimetype) => {
  const { bucket } = getS3Config();
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype || 'application/pdf',
    })
  );

  return fileName;
};

const deleteFile = async (fileName) => {
  const { bucket } = getS3Config();
  const client = getClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileName,
    })
  );
};

const getObjectSignedUrl = async (key) => {
  const { bucket } = getS3Config();
  const client = getClient();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
};

function isS3Configured() {
  try {
    getS3Config();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getObjectSignedUrl,
  getS3Config,
  isS3Configured,
  mapAwsError,
  getClient,
};
