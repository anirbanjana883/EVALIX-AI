import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({});

// 🌟 NEW: A simple helper function to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const QuestionGeneratorAgent = {
  // We added a "maxRetries" parameter, defaulting to 3 attempts
  async generateQuestions(syllabus, pyqs, instructions, marksDistribution, maxRetries = 3) {
    console.log("-> [Generator Agent] Crafting new questions...");

    const prompt = `
      You are an expert academic professor and exam setter. 
      Your task is to generate high-quality, novel exam questions based on the provided syllabus, while matching the style and difficulty of the Previous Year Questions (PYQs).

      Here is the context:
      1. Syllabus:
      "${syllabus}"
      
      2. Previous Year Questions (PYQs) for style reference:
      "${pyqs}"
      
      3. Teacher's Custom Instructions:
      "${instructions}"
      
      4. Required Marks Distribution:
      "${marksDistribution}"

      Respond STRICTLY with a JSON array containing the newly generated questions. Do not include markdown formatting or extra text.
      Format:
      [
        {
          "marks": 5,
          "question_text": "Explain the concept of...",
          "model_answer": "The ideal answer should include..."
        }
      ]
    `;

    // 🌟 THE UPGRADE: The Retry Loop
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        // Clean the string and parse it into a real JavaScript array
        const cleanJsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(`✅ [Generator Agent] Success on attempt ${attempt}!`);
        return JSON.parse(cleanJsonString);

      } catch (error) {
        console.error(`❌ [Generator Agent] Attempt ${attempt} Failed:`, error.message);
        
        // If it's a 503 (Busy) or 429 (Rate Limit), and we haven't run out of attempts...
        if (attempt < maxRetries && (error.status === 503 || error.status === 429)) {
          // Wait longer each time it fails (2 seconds, then 4 seconds...)
          const waitTime = attempt * 2000; 
          console.log(`⏳ AI is busy. Retrying in ${waitTime / 1000} seconds...`);
          await delay(waitTime);
        } else {
          // If we are out of tries, OR if it's a completely different error (like a bad API key), fail gracefully.
          throw new Error("The AI service is experiencing unusually high traffic. Please try again in a few moments.");
        }
      }
    }
  }
};