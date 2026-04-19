import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mapping friendly names to Google AI model identifiers
export const MODEL_MAPPING = {
  "Gemini 3 Flash": "gemini-3-flash",
  "Gemini 2.5 Flash": "gemini-2.5-flash",
  "Gemma 3 4B": "gemma-3-4b-it",
  "Gemma 3 12B": "gemma-3-12b-it",
};

// Default export if needed
export default genAI;
