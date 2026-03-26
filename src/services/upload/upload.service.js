const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { s3Client } = require("../../utils/s3")
const crypto = require("crypto")

const generateKey = async () => {
    const uniqueKey = crypto.randomUUID() + ".jpg";

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        ContentType: "image/jpeg",
        Key: uniqueKey
    })

    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 240 })

    return { uniqueKey, presignedUrl }
}

module.exports = { generateKey } 