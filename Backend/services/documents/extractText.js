import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/* -----------------------------
   AWS S3 CLIENT (v3)
------------------------------ */
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* -----------------------------
   HELPER: STREAM TO BUFFER
------------------------------ */
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

/* -----------------------------
   1. DOWNLOAD FILE AS BUFFER
------------------------------ */
export async function downloadFromS3(s3Key) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: s3Key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    return await streamToBuffer(response.Body);
  } catch (error) {
    console.error("❌ S3 Download Error:", error.message);
    throw new Error(`Failed to download file from S3: ${error.message}`);
  }
}

/* -----------------------------
   2. PDF TEXT EXTRACTION
------------------------------ */
async function extractPdf(buffer) {
  console.log("📄 Extracting PDF text...");
  console.log("Buffer size:", buffer.length, "bytes");

  try {
    // Convert Buffer to Uint8Array for pdfjs-dist
    const data = new Uint8Array(buffer);
    
    // Load the document
    const loadingTask = pdfjsLib.getDocument({ 
      data,
      useSystemFonts: true,
      disableFontFace: true 
    });
    
    const doc = await loadingTask.promise;
    console.log("📖 PDF loaded. Total pages:", doc.numPages);
    
    let fullText = "";
    
    // Iterate over all pages
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      
      console.log(`Page ${i}: Found ${textContent.items.length} text items`);
      
      // Extract text items and join them
      const pageText = textContent.items.map(item => item.str).join(" ");
      console.log(`Page ${i} text preview:`, pageText.substring(0, 200));
      
      fullText += pageText + "\n";
    }
    
    console.log("Total extracted text length:", fullText.length);
    console.log("First 500 chars:", fullText.substring(0, 500));
    
    if (fullText && fullText.trim().length > 0) {
      console.log("✅ PDF text extracted successfully");
      return fullText;
    }
    
    // If no text extracted, return a fallback message
    console.log("⚠️ No text found in PDF");
    return "No readable text found in this PDF document.";
    
  } catch (err) {
    console.error("❌ PDF extract error:", err.message);
    console.error(err.stack);
    // Return fallback text instead of throwing error
    return "Unable to extract text from this PDF document.";
  }
}

/* -----------------------------
   3. DOCX EXTRACTION
------------------------------ */
async function extractDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/* -----------------------------
   4. MAIN EXTRACTOR
------------------------------ */
export async function extractTextFromBuffer(buffer, mimeType) {
  try {
    mimeType = mimeType?.toLowerCase() || "";

    if (mimeType.includes("pdf")) {
      return await extractPdf(buffer);
    }

    if (mimeType.includes("docx") || mimeType.includes("word")) {
      return await extractDocx(buffer);
    }

    throw new Error("Unsupported file type: " + mimeType);
  } catch (error) {
    console.error("Error in extractTextFromBuffer:", error.message);
    throw error;
  }
}

/* -----------------------------
   5. CLEAN TEXT
------------------------------ */
export function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

