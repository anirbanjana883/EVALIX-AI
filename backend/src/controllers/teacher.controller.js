import { TeacherRepository } from '../repositories/teacher.repository.js';
import { QuestionGeneratorAgent } from '../agents/generatorAgent.js';

export const TeacherController = {
  
  async getDashboard(req, res) {
    try {
      const teacherId = req.user.id;
      // Capture the search term if the user types in the search bar
      const searchQuery = req.query.search || ""; 

      const dashboardData = await TeacherRepository.getDashboardOverview(teacherId, searchQuery);
      
      return res.status(200).json(dashboardData);
    } catch (error) {
      console.error("[Teacher] Dashboard Error:", error);
      return res.status(500).json({ error: "Failed to load dashboard overview" });
    }
  },

  async getAssignmentView(req, res) {
    try {
      const teacherId = req.user.id;
      const { id } = req.params; // Assignment ID
      
      const data = await TeacherRepository.getAssignmentDashboard(id, teacherId);
      if (!data) return res.status(404).json({ error: "Assignment not found or unauthorized" });

      return res.status(200).json(data);
    } catch (error) {
      console.error("[Teacher] Assignment View Error:", error);
      return res.status(500).json({ error: "Failed to load assignment details" });
    }
  },

  async getSubmissionReview(req, res) {
    try {
      const { submissionId } = req.params;
      const submission = await TeacherRepository.getSubmissionDetails(submissionId);
      
      if (!submission) return res.status(404).json({ error: "Submission not found" });
      return res.status(200).json({ submission });
    } catch (error) {
      console.error("[Teacher] Submission Review Error:", error);
      return res.status(500).json({ error: "Failed to load submission" });
    }
  },

  async overrideGrade(req, res) {
    try {
      const { submissionId, answerId } = req.params;
      const { newScore, teacherFeedback } = req.body;

      if (newScore === undefined) return res.status(400).json({ error: "New score is required" });

      const result = await TeacherRepository.overrideAnswerScore(
        submissionId, 
        answerId, 
        parseFloat(newScore), 
        teacherFeedback
      );

      return res.status(200).json({
        message: "Grade overridden successfully",
        newTotalScore: result.newTotalScore
      });
    } catch (error) {
      console.error("[Teacher] Override Error:", error);
      return res.status(500).json({ error: "Failed to override grade" });
    }
  },

  async generateExam(req, res) {
    try {
      const { syllabus, pyqs, instructions, marksDistribution } = req.body;

      // Validation
      if (!syllabus || !marksDistribution) {
        return res.status(400).json({ error: "Syllabus and Marks Distribution are required." });
      }

      // Call the Gemini Agent to do the heavy lifting
      const generatedQuestions = await QuestionGeneratorAgent.generateQuestions(
        syllabus, 
        pyqs, 
        instructions, 
        marksDistribution
      );

      // Return the JSON array of questions to the frontend
      return res.status(200).json({ 
        success: true, 
        questions: generatedQuestions 
      });

    } catch (error) {
      console.error("[Teacher] AI Generation Error:", error);
      return res.status(500).json({ error: "Failed to generate questions. Please try again." });
    }
  }
};