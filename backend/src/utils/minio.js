const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'learning-files';

// Ensure bucket exists
const initBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log('Bucket ' + bucketName + ' created');
    }
  } catch (error) {
    console.error('MinIO bucket initialization error:', error);
  }
};

const uploadFile = async (file, objectName) => {
  return await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
    'Content-Type': file.mimetype
  });
};

const getFileUrl = (objectName) => {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  return protocol + '://' + process.env.MINIO_ENDPOINT + ':' + process.env.MINIO_PORT + '/' + bucketName + '/' + objectName;
};

module.exports = { minioClient, initBucket, uploadFile, getFileUrl, bucketName };
