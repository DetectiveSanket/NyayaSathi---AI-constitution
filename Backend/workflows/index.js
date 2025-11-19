import { PineconeClient } from "@pinecone-database/pinecone";

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENV
});
const index = client.Index(process.env.PINECONE_INDEX);

// sample vector (replace with real embedding)
await index.upsert({
  upsertRequest: {
    vectors: [
      {
        id: "doc1_chunk1",
        metadata: { documentId: "doc1", chunkIndex: 0, text: "..." },
        values: [/* numeric vector array of length = dimension */]
      }
    ],
  },
});
console.log("upserted");
