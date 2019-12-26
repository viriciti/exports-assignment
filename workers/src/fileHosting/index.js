const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
    },
    region: process.env.AWS_REGION,
});

const bucket = process.env.AWS_S3_BUCKET;

const CHUNK_SIZE = 10 * 1024 * 1024;
const CONCURRENT = 1;

function uploadFile (fileName, stream) {
    return s3.upload({
        Bucket: bucket,
        Key: fileName,
        Body: stream,
        partSize: CHUNK_SIZE,
        queueSize: CONCURRENT
    }).promise();
}

module.exports = { uploadFile };