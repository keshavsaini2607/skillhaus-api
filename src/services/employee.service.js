const AWS = require('aws-sdk');

// Configure AWS with credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

async function getWorkEligibilityDocFromS3({folder, uuid}) {
    try {
        const s3Key = `employee/${folder}/${uuid}.pdf`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key
        };
        
        const data = await s3.getObject(params).promise();
        return data.Body;
    } catch (error) {
        console.error('S3 Access Error:', error);
        throw new Error('Failed to access document from S3');
    }
}

module.exports = {
    getWorkEligibilityDocFromS3
}