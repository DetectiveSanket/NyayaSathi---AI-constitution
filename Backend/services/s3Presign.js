
// src/services/s3Presign.js

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3Client.js";
import dotenv from "dotenv";

dotenv.config();

export async function getPresignedPutUrl({ Key, ContentType, expiresIn = 60 * 10 }) {
    // Validate environment variables
    if (!process.env.S3_BUCKET) {
        throw new Error("S3_BUCKET environment variable is not set");
    }
    
    if (!process.env.S3_REGION) {
        throw new Error("S3_REGION environment variable is not set");
    }
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error("AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not set");
    }

    try {
        const cmd = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key,
            ContentType,
        });
        return await getSignedUrl(s3Client, cmd, { expiresIn });
    } catch (error) {
        console.error("❌ S3 presign error details:", {
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION,
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
            error: error.message,
        });
        throw error;
    }
}
