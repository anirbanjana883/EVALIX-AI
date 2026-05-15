import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const SubmissionRepository = {
  async getAssignmentWithQuestions(assignmentId) {
    return await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true },
    });
  },

  async checkExistingSubmission(studentId, assignmentId) {
    return await prisma.submission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId,
        },
      },
    });
  },

  async createPendingSubmission(studentId, assignmentId, answers) {
    return await prisma.submission.create({
      data: {
        student_id: studentId,
        assignment_id: assignmentId,
        status: "PROCESSING",
        answers: {
          create: answers.map((ans) => ({
            question_id: ans.questionId,

            // 🌟 THE FIX: Save the array of URLs instead of a single string
            // Make sure your frontend sends 'fileUrls' instead of 'fileUrl'
            file_urls: ans.fileUrls || [],

            mcq_selected: ans.selectedOption || null,
            status: "PENDING",
          })),
        },
      },
      include: { answers: true },
    });
  },

  // 🌟 UPDATED: Now receives structured OCR and AI data objects
  async updateAnswerResult(submissionId, questionId, ocrData, evalData) {
    await prisma.answer.update({
      where: {
        submission_id_question_id: {
          submission_id: submissionId,
          question_id: questionId,
        },
      },
      data: {
        // OCR Fields
        ocr_text: ocrData.text,
        ocr_confidence: ocrData.confidence,

        // Evaluation Fields
        score: evalData.score,
        ai_feedback: evalData.feedback,
        strengths: evalData.strengths,
        weaknesses: evalData.weaknesses,
        missing_concepts: evalData.missingConcepts,
        eval_confidence: evalData.evalConfidence,
        flagged: evalData.flagged,

        status: "EVALUATED",
      },
    });
  },

  async markAnswerFailed(submissionId, questionId) {
    await prisma.answer.update({
      where: {
        submission_id_question_id: {
          submission_id: submissionId,
          question_id: questionId,
        },
      },
      data: {
        status: "FAILED",
        flagged: true, // Force teacher review if AI crashed
      },
    });
  },

  // 🌟 UPDATED: Accepts the global requiresReview flag
  async finalizeSubmissionScore(
    submissionId,
    totalScore,
    requiresReview = false,
  ) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        total_score: totalScore,
        status: "GRADED",
        requires_review: requiresReview,
      },
    });
  },

  async getStudentSubmissionResult(assignmentId, studentId) {
    return await prisma.submission.findUnique({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId,
        },
      },
      include: {
        // 1. Fetch the original assignment and questions
        assignment: {
          include: {
            questions: true,
          },
        },

        // 2. Fetch answers ordered nicely (this automatically includes strengths/weaknesses JSON!)
        answers: {
          orderBy: { question_id: "asc" },
        },

        // 3. 🚨 PRIVACY-SAFE PLAGIARISM FETCH
        // We only show the score and status. We hide 'matched_submission_id'
        // so students don't know who they matched with!
        plagiarism_reports: {
          select: {
            similarity_score: true,
            status: true,
            created_at: true,
          },
        },

        // 4. 👨‍🏫 Fetch Teacher Review to show manual grade overrides
        teacher_review: true,
      },
    });
  },
};
