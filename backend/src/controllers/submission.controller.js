import { SubmissionRepository } from '../repositories/submission.repository.js';
import { McqEvaluationService } from '../services/mcq.evaluator.js';
import { AiEvaluationService } from '../services/ai.evaluator.js';
import { sendMailAsync } from '../services/mail.service.js'; // 🌟 ADD
import { submissionConfirmationTemplate } from '../services/mail.templates.js'; // 🌟 ADD

export const SubmitController = {
  async handleSubmission(req, res) {
    try {
      const { assignmentId, answers } = req.body; 
      const studentId = req.user.id; 
      const studentEmail = req.user.email;

      if (!assignmentId || !answers || answers.length === 0) {
        return res.status(400).json({ error: "Missing assignment ID or answers." });
      }

      // 1. Fetch Assignment to check the Type (MCQ vs DESCRIPTIVE)
      const assignment = await SubmissionRepository.getAssignmentWithQuestions(assignmentId);
      if (!assignment) return res.status(404).json({ error: "Assignment not found." });

      // ==========================================
      // 🛡️ THE DOUBLE-SUBMISSION SHIELD
      // ==========================================
      const existingSubmission = await SubmissionRepository.checkExistingSubmission(studentId, assignmentId);
      if (existingSubmission) {
        return res.status(400).json({ 
          error: "You have already submitted this assignment.",
          status: existingSubmission.status 
        });
      }
      // ==========================================

      // 2. Create the Submission and all Pending Answers in DB 
      const submission = await SubmissionRepository.createPendingSubmission(
        studentId, 
        assignmentId, 
        answers
      );

      sendMailAsync({
        to: studentEmail,
        subject: `Submission Received: ${assignment.title}`,
        html: submissionConfirmationTemplate(assignment.title)
      });

      // 3. ROUTE TO THE CORRECT PIPELINE
      if (assignment.type === 'MCQ') {
        
        // SYNCHRONOUS: Grade instantly and await the result
        const finalScore = await McqEvaluationService.evaluate(submission.id, assignment, answers);
        
        return res.status(200).json({
          message: "MCQ Graded successfully.",
          status: "GRADED",
          score: finalScore
        });

      } else if (assignment.type === 'DESCRIPTIVE') {
        
        // ASYNCHRONOUS: Fire the background AI service (DO NOT await)
        AiEvaluationService.evaluateBackground(submission.id, assignment, answers)
          .catch(err => console.error("Critical AI Pipeline Failure:", err));

        return res.status(202).json({
          message: "Submission received. AI Evaluation is processing in the background.",
          status: "PENDING",
          submissionId: submission.id
        });

      } else {
        // 🌟 FIX: The Fallback! Catch invalid assignment types so the server doesn't hang.
        return res.status(400).json({ 
          error: "Invalid assignment format. Cannot process submission." 
        });
      }

    } catch (error) {
      console.error("[Controller] Submission Error:", error);
      return res.status(500).json({ error: "Failed to process submission" });
    }
  }
};