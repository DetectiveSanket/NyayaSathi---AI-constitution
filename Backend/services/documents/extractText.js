import AWS from "aws-sdk";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import { TextEncoder } from "util";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

/* --------------------- DOWNLOAD FILE FROM S3 --------------------- */
export async function downloadFromS3(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: s3Key
  };

  const file = await s3.getObject(params).promise();
  return file.Body;   // Buffer
}

/* --------------------- PDF TEXT EXTRACTION ------------------------ */
async function extractPdfText(buffer) {
  try {
    const data = await pdf(buffer);
    if (data.text.trim().length > 20) return data.text;
  } catch (err) {
    console.log("pdf-parse failed, trying fallback extractor…");
  }

  // Fallback OCR
  return await extractPdfWithOCR(buffer);
}

/* --------------------- PDF OCR EXTRACTION ------------------------- */
async function extractPdfWithOCR(buffer) {
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  let fullText = "";

  console.log("OCR: starting scanning… this may take time.");

  for (let i = 0; i < pages.length; i++) {
    const img = await pages[i].render({}); // render page as image buffer

    const result = await Tesseract.recognize(img, "eng", {
      logger: (m) => console.log(m),
    });

    fullText += result.data.text + "\n";
  }

  return fullText;
}

/* --------------------- DOCX EXTRACTION ---------------------------- */
async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/* --------------------- MAIN EXTRACTOR ---------------------------- */
export async function extractTextFromFile(s3Key) {
  const buffer = await downloadFromS3(s3Key);

  const extension = s3Key.split(".").pop().toLowerCase();

  if (extension === "pdf") {
    return await extractPdfText(buffer);
  }

  if (extension === "docx") {
    return await extractDocxText(buffer);
  }

  throw new Error("Unsupported file type: " + extension);
}

/* --------------------- CLEAN TEXT ---------------------------- */
export function cleanText(text) {
  return text
    .replace(/\s+/g, " ")     // remove extra whitespace
    .replace(/\n\s*\n/g, "\n") // remove empty lines
    .trim();
}

/* --------------------- CHUNKING WITH OVERLAP -------------------- */
export function chunkText(text, chunkSize = 500, overlap = 100) {
  const encoder = new TextEncoder();
  const tokens = encoder.encode(text); 

  let chunks = [];
  let start = 0;

  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);

    const chunk = text.slice(start, end);
    chunks.push(chunk);

    start += chunkSize - overlap;
  }

  return chunks;
}
