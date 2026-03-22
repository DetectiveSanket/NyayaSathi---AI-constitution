import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import 'dotenv/config';

async function testEmbedding(modelName) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: modelName,
      // Pass client-side truncation or output dimensionality parameter?
      // Not sure if it's supported by LangChain
    });
    // Check if we can just slice to 768? 
    // Wait, let's just see if there's any dimension property. The LangChain class doesn't expose it directly except in constructor maybe?
  } catch (e) {
  }
}
async function run() {
  const genAI = new (await import("@google/generative-ai")).GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  try {
    const result = await model.embedContent("test");
    console.log("Raw genAI gemini-embedding-001 dim:", result.embedding.values.length);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
