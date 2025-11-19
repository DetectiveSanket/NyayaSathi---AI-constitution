import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import dot from "dotenv"

dot.config()


const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    temperature: 0,
    maxRetries: 2,
    apiKey: process.env.GOOGLE_API_KEY,
    // other params...
})

const aiMsg = await llm.invoke([
    [
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ],
    ["human", "I love programming."],
])


console.log({ aiMsg })