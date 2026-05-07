import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize Gemini Client (Primary)
const geminiClient = new GoogleGenAI({}); // Automatically uses process.env.GEMINI_API_KEY

// 2. Initialize Groq Client (Fallback)
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Groq's OpenAI-compatible endpoint
});

export const ocrAgent = async (fileUrl) => {
  console.log(`-> [OCR Agent] Attempting extraction with primary AI (Gemini)...`);
  
  // Fetch and convert image to Base64 (Both APIs require this format)
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

  const prompt = `Please transcribe exactly what is written in this image. The text is handwritten and might be rotated. Read it carefully and return ONLY the extracted text.`;

  // === PRIMARY ATTEMPT: GEMINI ===
  try {
    const aiResponse = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        { inlineData: { data: base64Image, mimeType: mimeType } }
      ]
    });
    
    console.log(`-> [OCR Agent] Gemini success!`);
    return { ocrText: aiResponse.text.trim() };
    
  } catch (geminiError) {
    console.warn(`⚠️ [OCR Agent] Gemini Failed (${geminiError.message}). Switching to Groq...`);
    
    // === FALLBACK ATTEMPT: GROQ ===
    try {
      // Groq's OpenAI format requires the Base64 data URI string format
      const base64Url = `data:${mimeType};base64,${base64Image}`;
      
      const groqResponse = await groqClient.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", 
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
      
      console.log(`-> [OCR Agent] Groq Fallback success!`);
      return { ocrText: groqResponse.choices[0].message.content.trim() };

    } catch (groqError) {
      console.error("❌ [OCR Agent] BOTH APIs FAILED!");
      return { ocrText: "", error: "Both Gemini and Groq APIs failed to process the image." };
    }
  }
};