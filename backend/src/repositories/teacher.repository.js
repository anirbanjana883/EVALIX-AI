import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const TeacherRepository = {
  // 1. Get all assignments created by this teacher
  async getDashboardOverview(teacherId, searchQuery = "") {
    const now = new Date();

    const activeAssignments = await prisma.assignment.count({
      where: { teacher_id: teacherId, end_time: { gt: now } },
    });

    const pendingEvaluations = await prisma.submission.count({
      where: { assignment: { teacher_id: teacherId }, status: "PROCESSING" }, // 🌟 Updated status
    });

    // 🌟 NEW KPI: Submissions that the AI flagged for Plagiarism or Low Confidence
    const flaggedEvaluations = await prisma.submission.count({
      where: { assignment: { teacher_id: teacherId }, requires_review: true },
    });

    const gradedSubmissions = await prisma.submission.findMany({
      where: { assignment: { teacher_id: teacherId }, status: "GRADED" },
      include: { assignment: { include: { questions: true } } },
    });

    let totalPercentage = 0;
    if (gradedSubmissions.length > 0) {
      gradedSubmissions.forEach((sub) => {
        const maxMarks = sub.assignment.questions.reduce((sum, q) => sum + q.max_marks, 0);
        const score = sub.total_score || 0;
        const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;
        totalPercentage += percentage;
      });
    }
    const avgPerformance = gradedSubmissions.length > 0
        ? Math.round(totalPercentage / gradedSubmissions.length)
        : 0;

    const recentAssignments = await prisma.assignment.findMany({
      where: {
        teacher_id: teacherId,
        title: { contains: searchQuery, mode: "insensitive" },
      },
      orderBy: { created_at: "desc" },
      take: 10,
      include: { _count: { select: { submissions: true } } },
    });

    return {
      activeAssignments,
      pendingEvaluations,
      flaggedEvaluations, // 🌟 Added to dashboard
      avgPerformance,
      recentAssignments,
    };
  },

  // 2. Get detailed stats for a specific assignment
  async getAssignmentDashboard(assignmentId, teacherId) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, teacher_id: teacherId },
      include: {
        questions: true,
        submissions: {
          include: {
            student: { select: { name: true, email: true } },
            // 🌟 NEW: Include the requires_review flag so UI can show a red warning badge
          },
        },
      },
    });

    if (!assignment) return null;

    const gradedSubmissions = assignment.submissions.filter((s) => s.status === "GRADED");
    const averageScore = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / gradedSubmissions.length
        : 0;

    const totalMarks = assignment.questions.reduce((sum, q) => sum + (q.max_marks || 0), 0);

    return {
      assignmentInfo: {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject,
        type: assignment.type,
        department: assignment.department,
        year: assignment.year,
        batch: assignment.batch,
        deadline: assignment.end_time,
        release_marks_at: assignment.release_marks_at,
        total_marks: totalMarks
      },
      stats: {
        totalSubmissions: assignment.submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        flaggedSubmissions: assignment.submissions.filter(s => s.requires_review).length, // 🌟 NEW stat
        averageScore: averageScore.toFixed(2),
      },
      submissions: assignment.submissions,
    };
  },

  // 3. Get a single submission with all its answers (for the Teacher to review)
  async getSubmissionDetails(submissionId) {
    return await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: { select: { name: true, email: true, university_roll: true } },
        answers: {
          include: {
            question: true, 
          },
        },
        // 🌟 NEW: Fetch the plagiarism reports for the side-by-side view!
        plagiarism_reports: {
          include: {
            matched_submission: {
              include: { student: { select: { name: true } } }
            }
          }
        }
      },
    });
  },

  // 4. THE OVERRIDE ENGINE: Let a teacher manually change a grade
  async overrideAnswerScore(submissionId, answerId, newScore, teacherFeedback) {
    
    // A. Update the specific answer and REMOVE the flag
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        score: newScore,
        teacher_feedback: teacherFeedback,
        flagged: false, // 🌟 FIX: The teacher checked it, so it's no longer flagged!
      },
    });

    // B. Recalculate the Total Score for the entire Submission
    const allAnswers = await prisma.answer.findMany({
      where: { submission_id: submissionId },
      select: { score: true, flagged: true } 
    });

    const newTotalScore = allAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0);
    
    // 🌟 FIX: Check if there are any OTHER answers still flagged in this submission
    const stillNeedsReview = allAnswers.some(ans => ans.flagged === true);

    // C. Save the new total score and update the global review status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        total_score: newTotalScore,
        requires_review: stillNeedsReview // 🌟 Clears the dashboard warning if all flags are resolved
      },
    });

    return { newTotalScore, updatedAnswer };
  }
};