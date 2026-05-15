import { GoogleGenAI } from "@google/genai";
import { apiKeyManager } from "../utils/keyManager.js";

export const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }

  try {
    const currentKey = apiKeyManager.getCurrentKey();

    const ai = new GoogleGenAI({
      apiKey: currentKey,
    });

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = response.embeddings[0].values;

    console.log("✅ Embedding dimension:", embedding.length);

    return embedding;
  } catch (error) {
    console.error("❌ Embedding Generation Error:", error);
    throw error;
  }
};