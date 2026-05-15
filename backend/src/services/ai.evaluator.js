import { SubmissionRepository } from "../repositories/submission.repository.js";
import { ocrAgent } from "../agents/ocrAgent.js";
import { llmAgent } from "../agents/llmAgent.js";
import { PlagiarismService } from '../services/plagiarism.service.js'; 
import { RagService } from '../services/rag.service.js'; 

const cleanText = (rawText) => {
  if (!rawText) return "";
  return rawText
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.,?!\-+*/=^(){}[\]:;<>]/g, "")
    .trim();
};

export const AiEvaluationService = {
  async evaluateBackground(submissionId, assignment, studentAnswers) {
    console.log(
      `\n🚀 AI Background Pipeline Started for Submission: ${submissionId}`,
    );

    let totalCalculatedScore = 0;
    let highRiskSubmission = false; 

    for (const answer of studentAnswers) {
      try {
        const dbQuestion = assignment.questions.find(
          (q) => q.id === answer.questionId,
        );
        
        // 🌟 FIX 1: Check for an array of fileUrls instead of just one
        const urlsToProcess = answer.fileUrls || (answer.fileUrl ? [answer.fileUrl] : []);
        if (!dbQuestion || urlsToProcess.length === 0) continue;

        // 🌟 FIX 2: OCR Extraction (Handling Multiple Pages)
        let combinedOcrText = "";
        let lowestConfidence = 100;

        for (const url of urlsToProcess) {
          const {
            ocrText,
            confidence_score,
            error,
          } = await ocrAgent(url);
          
          if (error) throw new Error(error);

          // Combine the text from each page
          combinedOcrText += ocrText + "\n\n";
          
          // Track the lowest confidence score across all pages for flagging
          if (confidence_score < lowestConfidence) {
            lowestConfidence = confidence_score;
          }
        }

        // Set the final confidence score (fallback to 99 if something weird happens)
        const ocrConfidence = lowestConfidence === 100 ? 99 : lowestConfidence;

        // 2. Preprocess combined text
        const processedText = cleanText(combinedOcrText);

        // 3. PLAGIARISM CHECK (Vector Search)
        const plagiarismResult = await PlagiarismService.runDetection(
          submissionId,
          dbQuestion.id,
          processedText,
        );

        // 4. RAG RETRIEVAL (Syllabus Context)
        const courseContext = await RagService.getRelevantContext(
          assignment.id, 
          processedText
        );

        // 5. LLM (Brain) Evaluation - Now powered by RAG!
        const aiResult = await llmAgent(
          dbQuestion.question_text,
          processedText,
          dbQuestion.model_answer,
          dbQuestion.max_marks,
          courseContext 
        );

        // 6. Validate Score
        const finalAnswerScore = Math.min(
          Math.max(0, aiResult.score || 0),
          dbQuestion.max_marks,
        );
        totalCalculatedScore += finalAnswerScore;

        // 7. FLAGGING LOGIC 
        const isFlagged =
          aiResult.flagged ||
          plagiarismResult.isPlagiarized ||
          (ocrConfidence && ocrConfidence < 60) ||
          (aiResult.evalConfidence && aiResult.evalConfidence < 70);

        if (isFlagged) {
          highRiskSubmission = true;
          console.warn(
            `🚩 Answer ${dbQuestion.id} flagged for Teacher Review.`,
          );
        }

        // 8. Update DB with rich structured data
        await SubmissionRepository.updateAnswerResult(
          submissionId,
          dbQuestion.id,
          {
            text: processedText,
            confidence: ocrConfidence,
          },
          {
            score: finalAnswerScore,
            feedback: aiResult.feedback,
            strengths: aiResult.strengths || [],
            weaknesses: aiResult.weaknesses || [],
            missingConcepts: aiResult.missingConcepts || [],
            evalConfidence: aiResult.evalConfidence || 99,
            flagged: isFlagged,
          },
        );

        console.log(
          `✅ Evaluated Question ${dbQuestion.id}. Score: ${finalAnswerScore}`,
        );
      } catch (error) {
        console.error(
          `❌ Failed to evaluate question ${answer.questionId}:`,
          error,
        );
        await SubmissionRepository.markAnswerFailed(
          submissionId,
          answer.questionId,
        );
        highRiskSubmission = true; 
      }
    }

    // 9. Finalize the score 
    await SubmissionRepository.finalizeSubmissionScore(
      submissionId,
      totalCalculatedScore,
      highRiskSubmission,
    );
    console.log(
      `🎉 AI Pipeline Complete for Submission ${submissionId}. Total: ${totalCalculatedScore} | Needs Review: ${highRiskSubmission}`,
    );
  },
};