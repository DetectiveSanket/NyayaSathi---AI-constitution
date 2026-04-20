// src/services/s3Client.js
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
if (!process.env.S3_REGION) {
  console.warn("⚠️ S3_REGION environment variable is not set");
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.warn("⚠️ AWS_ACCESS_KEY_ID environment variable is not set");
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn("⚠️ AWS_SECRET_ACCESS_KEY environment variable is not set");
}
if (!process.env.S3_BUCKET) {
  console.warn("⚠️ S3_BUCKET environment variable is not set");
}

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default s3Client;

export async function deleteObjectFromS3(s3Key) {
  if (!s3Key) return false;
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
    });
    await s3Client.send(command);
    console.log(`✅ Deleted S3 object: ${s3Key}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to delete S3 object ${s3Key}:`, err);
    return false;
  }
}
