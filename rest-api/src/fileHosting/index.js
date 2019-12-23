const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
    },
    region: process.env.AWS_REGION
});

const bucket = process.env.AWS_S3_BUCKET;

const SIGNED_URL_EXPIRES_SECONDS = 60 * 5;

function getTempLink (fileKey) {
    return s3.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: fileKey,
        Expires: SIGNED_URL_EXPIRES_SECONDS
    });
}

module.exports = { getTempLink };