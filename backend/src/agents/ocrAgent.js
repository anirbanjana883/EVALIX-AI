import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { apiKeyManager } from '../utils/keyManager.js';
import dotenv from 'dotenv';

dotenv.config();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Groq Client (Ultimate Fallback)
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", 
});

export const ocrAgent = async (fileUrl) => {
  console.log(`-> [OCR Agent] Attempting extraction with primary AI (Gemini Pool)...`);
  
  let base64Image, mimeType;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch image from Supabase");
    const arrayBuffer = await response.arrayBuffer();
    base64Image = Buffer.from(arrayBuffer).toString('base64');
    mimeType = response.headers.get('content-type') || 'image/jpeg';
  } catch (error) {
    return { ocrText: "", error: "Image fetch failed: " + error.message };
  }

  const prompt = `
    You are a world-class handwriting recognition engine. 
    Carefully transcribe exactly what is written in this student exam paper. 
    - Handle cursive, messy text, and skewed angles.
    - Accurately transcribe mathematical formulas, pseudocode, and chemical equations if present.
    - Ignore page margins, teacher markings, or stray scribbles.
    - Do NOT summarize or evaluate the text. Return ONLY the pure transcription.
  `;

  // === PRIMARY ATTEMPT: GEMINI KEY ROTATION ===
  const maxAttempts = apiKeyManager.getTotalKeys();
  let geminiSuccess = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const currentKey = apiKeyManager.getCurrentKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          { inlineData: { data: base64Image, mimeType: mimeType } }
        ]
      });
      
      console.log(`✅ [OCR Agent] Gemini extraction success using Key #${apiKeyManager.currentIndex + 1}!`);
      return { ocrText: aiResponse.text.trim() };
      
    } catch (geminiError) {
      console.warn(`⚠️ [OCR Agent] Attempt ${attempt} Failed with Key #${apiKeyManager.currentIndex + 1}: ${geminiError.message}`);
      
      if (geminiError.status === 429 || geminiError.status === 503 || geminiError.status === 403) {
        if (attempt < maxAttempts) {
          apiKeyManager.rotateKey();
          await delay(1000); 
          continue;
        }
      }
    }
  }

  // === ULTIMATE FALLBACK: GROQ ===
  if (!geminiSuccess) {
    console.warn(`🚨 [OCR Agent] ALL 9 GEMINI KEYS FAILED! Initiating Groq Fallback...`);
    try {
      const base64Url = `data:${mimeType};base64,${base64Image}`;
      
      const groqResponse = await groqClient.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groq vision model
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: base64Url } }
            ]
          }
        ]
      });
      
      console.log(`✅ [OCR Agent] Groq Fallback success!`);
      return { ocrText: groqResponse.choices[0].message.content.trim() };

    } catch (groqError) {
      console.error("❌ [OCR Agent] CATASTROPHIC FAILURE: Both Gemini Pool and Groq APIs failed!");
      return { ocrText: "", error: "Both primary and fallback AI services failed to process the image." };
    }
  }
};