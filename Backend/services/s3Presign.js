
// src/services/s3Presign.js

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3Client.js";
import dotenv from "dotenv";

dotenv.config();

export async function getPresignedPutUrl({ Key, ContentType, expiresIn = 60 * 10 }) {
    const cmd = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key,
        ContentType,
    });
    return await getSignedUrl(s3Client, cmd, { expiresIn });
}
