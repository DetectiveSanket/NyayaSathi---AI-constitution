// src/services/agent/googleModel.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();


export function createGoogleModel(modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash") {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: modelName,
    maxOutputTokens: 2048,
    temperature: 0.2,
  });
}
