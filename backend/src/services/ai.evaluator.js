import { SubmissionRepository } from '../repositories/submission.repository.js';
import { ocrAgent } from '../agents/ocrAgent.js';
import { llmAgent } from '../agents/llmAgent.js';

// Internal helper to normalize the OCR text before sending it to the LLM
const cleanText = (rawText) => {
  if (!rawText) return "";
  return rawText.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s.,?!-]/g, '').trim();
};

export const AiEvaluationService = {
  
  // Notice this loop! It processes every uploaded image in the test sequentially.
  async evaluateBackground(submissionId, assignment, studentAnswers) {
    console.log(`\n🚀 AI Background Pipeline Started for Submission: ${submissionId}`);
    let totalCalculatedScore = 0;

    for (const answer of studentAnswers) {
      try {
        const dbQuestion = assignment.questions.find(q => q.id === answer.questionId);
        if (!dbQuestion || !answer.fileUrl) continue;

        // 1. OCR (Read the handwriting from the Supabase URL)
        const { ocrText, error } = await ocrAgent(answer.fileUrl);
        if (error) throw new Error(error);

        // 2. Preprocess text
        const processedText = cleanText(ocrText);

        // 3. LLM (Brain) - Evaluates directly against the new model_answer!
        // Notice how clean this is now. No database calls, just passing the text directly.
        const aiResult = await llmAgent(processedText, dbQuestion.model_answer, dbQuestion.max_marks);

        // 4. Validate Score (Ensure the AI didn't hallucinate a score higher than max_marks or below 0)
        const finalAnswerScore = Math.min(Math.max(0, aiResult.score || 0), dbQuestion.max_marks);
        totalCalculatedScore += finalAnswerScore;

        // 5. Update this specific answer in DB
        // We pass 'aiResult.feedback' directly as a string into the new ai_feedback column
        await SubmissionRepository.updateAnswerResult(
          submissionId, 
          dbQuestion.id, 
          processedText, 
          finalAnswerScore, 
          aiResult.feedback 
        );

        console.log(`✅ Evaluated Question ${dbQuestion.id}. Score: ${finalAnswerScore}`);

      } catch (error) {
        console.error(`❌ Failed to evaluate question ${answer.questionId}:`, error);
        await SubmissionRepository.markAnswerFailed(submissionId, answer.questionId);
      }
    }

    // After the loop finishes evaluating all uploaded images, finalize the total score!
    await SubmissionRepository.finalizeSubmissionScore(submissionId, totalCalculatedScore);
    console.log(`🎉 AI Pipeline Complete for Submission ${submissionId}. Total Score: ${totalCalculatedScore}`);
  }
};