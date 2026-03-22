import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import 'dotenv/config';

async function testEmbedding(modelName) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: modelName,
    });
    const result = await embeddings.embedQuery("test");
    console.log(`Model: ${modelName} -> Dimension: ${result.length}`);
  } catch (e) {
    console.log(`Model: ${modelName} -> Error: ${e.message}`);
  }
}

async function run() {
  await testEmbedding("embedding-001");
  await testEmbedding("text-embedding-004");
  await testEmbedding("gemini-embedding-001");
  await testEmbedding("models/gemini-embedding-001");
  await testEmbedding("models/gemini-embedding-2-preview");
}

run();
