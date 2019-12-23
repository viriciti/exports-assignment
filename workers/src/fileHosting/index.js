const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
    },
    region: 'eu-central-1'
});

const bucket = process.env.AWS_S3_BUCKET;

function uploadFile (fileName, buffer) {
    return s3.putObject({
        Bucket: bucket,
        Key: fileName,
        Body: buffer
    }).promise();
}

module.exports = { uploadFile };