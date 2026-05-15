import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../utils/keyManager.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const llmAgent = async (question, studentAnswer, modelAnswer, maxMarks, courseContext) => {
  console.log("-> [LLM Agent] Asking Gemini for detailed evaluation...");
  
  const prompt = `
    You are a rigorous but empathetic university professor evaluating a student's exam answer.
    
    REFERENCE MATERIAL:
    - Question Asked: "${question}"
    - Teacher's Gold Standard Answer: "${modelAnswer || 'No model answer provided. Grade based on absolute factual accuracy.'}"
    - Course Syllabus / Context: "${courseContext || 'Standard academic principles apply.'}"
    - Maximum Possible Marks: ${maxMarks}
    
    STUDENT'S SUBMISSION:
    "${studentAnswer}"

    YOUR TASK:
    Evaluate the student's answer against the Gold Standard and the Course Syllabus. 
    
    REQUIRED JSON FORMAT:
    {
      "score": <number between 0 and ${maxMarks}, allow decimals like 3.5>,
      "feedback": "Write a 2-sentence encouraging summary.",
      "strengths": ["point 1", "point 2"],
      "weaknesses": ["point 1", "point 2"],
      "missingConcepts": ["concept 1 from syllabus", "concept 2 from model answer"],
      "evalConfidence": <number 0-100 based on how sure you are of this grade>,
      "flagged": <boolean true if the answer is complete nonsense, off-topic, or suspicious>
    }
    
    IMPORTANT: Output ONLY the raw JSON object. Do not wrap it in \`\`\`json markdown blocks.
  `;

  const maxAttempts = apiKeyManager.getTotalKeys();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const currentKey = apiKeyManager.getCurrentKey();
      const ai = new GoogleGenAI({ apiKey: currentKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // 🌟 Kept your original model!
        contents: prompt,
      });

      const cleanJsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      console.log(`✅ [LLM Agent] Grading complete using Key #${apiKeyManager.currentIndex + 1}!`);
      return JSON.parse(cleanJsonString);

    } catch (error) {
      console.error(`❌ [LLM Agent] Attempt ${attempt} Failed with Key #${apiKeyManager.currentIndex + 1}:`, error.message);
      
      if (error.status === 429 || error.status === 503 || error.status === 403) {
        if (attempt < maxAttempts) {
          apiKeyManager.rotateKey();
          await delay(1000); 
          continue;
        }
      }
      
      if (attempt === maxAttempts) {
        console.error("-> [LLM Agent] All keys exhausted.");
        return { 
          score: 0, 
          feedback: "⚠️ Evaluation Error: AI servers overloaded.",
          strengths: [], weaknesses: [], missingConcepts: [], evalConfidence: 0, flagged: true
        };
      }
    }
  }
};