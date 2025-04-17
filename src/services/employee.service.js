const AWS = require('aws-sdk');

// Configure AWS with credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

async function getWorkEligibilityDocFromS3(folder, subFolder, uuid) {
    try {
        const s3Key = `${folder}/${subFolder}/${uuid}.pdf`;
        console.log('S3 Key:', s3Key);
        const params = {
            Bucket: process.env.AWS_BUCKET_EMP,
            Key: s3Key,
            Expires: 3600 // URL expires in 1 hour
        };
        
        const signedUrl = await s3.getSignedUrlPromise('getObject', params);
        return signedUrl;
    } catch (error) {
        console.error('S3 Access Error:', error);
        throw new Error('Failed to generate signed URL for S3 document');
    }
}

module.exports = {
    getWorkEligibilityDocFromS3
}