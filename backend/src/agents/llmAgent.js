import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({});

export const llmAgent = async (studentAnswer, modelAnswer, maxMarks) => {
  console.log("-> [LLM Agent] Asking Gemini for detailed evaluation...");
  
  try {
    const prompt = `
      You are an expert, empathetic exam evaluator. Your job is to grade a student's answer by comparing it to the teacher's model answer.
      
      Teacher's Model Answer:
      "${modelAnswer || 'No model answer provided. Grade based on general factual accuracy.'}"

      Student's Answer:
      "${studentAnswer}"

      Max Possible Marks: ${maxMarks}

      Evaluate how accurately the student captured the core concepts of the model answer. 
      Respond STRICTLY with a JSON object in this format, and nothing else:
      {
        "score": 0, // A number between 0 and ${maxMarks}
        "feedback": "Write a detailed, comprehensive paragraph of feedback. Explicitly state what the student got right, identify exactly what concepts they missed from the model answer, and provide actionable advice on how they can improve."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanJsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error) {
    console.error("-> [LLM Agent] Gemini API Failed:", error);
    return { score: 0, feedback: "AI evaluation unavailable at this time." };
  }
};