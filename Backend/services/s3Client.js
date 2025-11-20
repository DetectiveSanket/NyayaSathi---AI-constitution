// src/services/s3Client.js
import { S3Client } from "@aws-sdk/client-s3";
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
