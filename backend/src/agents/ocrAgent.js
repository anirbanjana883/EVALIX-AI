import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import sharp from 'sharp'; // Required for preprocessing
import { apiKeyManager } from '../utils/keyManager.js';
import dotenv from 'dotenv';

dotenv.config();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", 
});

export const ocrAgent = async (fileUrl) => {
  console.log(`-> [OCR Agent] Fetching and Preprocessing image...`);
  
  let base64Image, mimeType;
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch image from Supabase");
    const arrayBuffer = await response.arrayBuffer();
    
    const inputBuffer = Buffer.from(arrayBuffer);
    const processedBuffer = await sharp(inputBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .jpeg({ quality: 80 })
      .toBuffer();

    base64Image = processedBuffer.toString('base64');
    mimeType = 'image/jpeg';
  } catch (error) {
    return { ocrText: "", confidence_score: 0, error: "Image fetch/process failed: " + error.message };
  }

  const prompt = `
    You are a world-class handwriting recognition engine. 
    Carefully transcribe exactly what is written in this student exam paper. 
    - Handle cursive, messy text, and skewed angles.
    - Accurately transcribe mathematical formulas, pseudocode, and chemical equations if present.
    
    RETURN ONLY A JSON OBJECT IN THIS FORMAT:
    {
      "transcription": "The full extracted text here...",
      "confidence_score": <number 0-100 based on how readable the handwriting is>
    }
    
    IMPORTANT: Output ONLY the raw JSON object. Do not wrap it in \`\`\`json markdown blocks.
  `;

  const maxAttempts = apiKeyManager.getTotalKeys();
  let geminiSuccess = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const currentKey = apiKeyManager.getCurrentKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // 🌟 Kept your original model!
        contents: [
          prompt,
          { inlineData: { data: base64Image, mimeType: mimeType } }
        ]
      });
      
      const cleanJsonString = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonString);

      console.log(`✅ [OCR Agent] Gemini extraction success using Key #${apiKeyManager.currentIndex + 1}!`);
      return { ocrText: parsed.transcription, confidence_score: parsed.confidence_score };
      
    } catch (geminiError) {
      console.warn(`⚠️ [OCR Agent] Attempt ${attempt} Failed with Key #${apiKeyManager.currentIndex + 1}: ${geminiError.message}`);
      
      if (geminiError.status === 429 || geminiError.status === 503 || geminiError.status === 403 || geminiError.name === 'SyntaxError') {
        if (attempt < maxAttempts) {
          apiKeyManager.rotateKey();
          await delay(1000); 
          continue;
        }
      }
    }
  }

  if (!geminiSuccess) {
    console.warn(`🚨 [OCR Agent] ALL GEMINI KEYS FAILED! Initiating Groq Fallback...`);
    try {
      const base64Url = `data:${mimeType};base64,${base64Image}`;
      
      const groqResponse = await groqClient.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // 🌟 Kept your original fallback!
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: base64Url } }
            ]
          }
        ],
        temperature: 0.1
      });
      
      const cleanJsonString = groqResponse.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonString);

      console.log(`✅ [OCR Agent] Groq Fallback success!`);
      return { ocrText: parsed.transcription, confidence_score: parsed.confidence_score };

    } catch (groqError) {
      console.error("❌ [OCR Agent] CATASTROPHIC FAILURE: Both primary and fallback AI failed!");
      return { ocrText: "", confidence_score: 0, error: "Both primary and fallback AI services failed." };
    }
  }
};