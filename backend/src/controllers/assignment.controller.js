import { AssignmentRepository } from "../repositories/assignment.repository.js";
import { SubmissionRepository } from "../repositories/submission.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { sendMailAsync } from "../services/mail.service.js";
import { assignmentUploadTemplate } from "../services/mail.templates.js";
import { generateEmbedding } from "../services/embedding.service.js"; // 🌟 ADD THIS

export const AssignmentController = {
  async create(req, res) {
    try {
      const teacherId = req.user.id;
      const teacherName = req.user.name || "your teacher";

      // 🌟 Extract syllabus_text out of the body
      const { syllabus_text, ...assignmentData } = req.body;

      if (!assignmentData.questions || assignmentData.questions.length === 0) {
        return res
          .status(400)
          .json({ error: "An assignment must have at least one question." });
      }

      // 1. Create the Assignment & Questions in the Database
      const newAssignment =
        await AssignmentRepository.createAssignmentWithQuestions(
          teacherId,
          assignmentData,
        );
      console.log(
        `✅ [Assignment] Created successfully: ${newAssignment.title}`,
      );

      // ==========================================
      // 🧠 RAG PIPELINE: Embed the Syllabus
      // ==========================================
      if (syllabus_text && syllabus_text.trim().length > 0) {
        try {
          // Generate the 768-dimension vector
          const embeddingVector = await generateEmbedding(syllabus_text);

          // Save it to the database for future AI grading
          await AssignmentRepository.addAssignmentMaterial(
            newAssignment.id,
            "SYLLABUS",
            syllabus_text,
            embeddingVector,
          );
          console.log(
            `🧠 [RAG] Syllabus embedded and saved for vector search!`,
          );
        } catch (ragError) {
          console.error(
            "⚠️ [RAG] Failed to embed syllabus. Assignment created anyway.",
            ragError,
          );
        }
      }
      // ==========================================

      // ==========================================
      // 🚀 THE HACKATHON MAILING ENGINE
      // ==========================================
      const targetedStudents = await UserRepository.getTargetedStudents(
        newAssignment.department,
        newAssignment.year,
        newAssignment.batch,
      );

      if (targetedStudents && targetedStudents.length > 0) {
        Promise.all(
          targetedStudents.map((student) =>
            sendMailAsync({
              to: student.email,
              subject: `🚨 New Assignment Uploaded: ${newAssignment.title}`,
              html: assignmentUploadTemplate(
                newAssignment.title,
                teacherName,
                newAssignment.end_time,
              ),
            }),
          ),
        ).catch((err) => console.error("❌ Bulk Mail Failure:", err));

        console.log(
          `📧 Dispatching alert emails to ${targetedStudents.length} students...`,
        );
      }
      // ==========================================

      return res.status(201).json({
        success: true,
        message: "Assignment created successfully. AI Syllabus processed.",
        assignment: newAssignment,
      });
    } catch (error) {
      console.error("❌ [Assignment] Creation Error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to create assignment" });
    }
  },

  async getStudentAssignments(req, res) {
    try {
      // 🌟 FIX 1: Safely handle both Supabase JWT structure AND Postgres DB structure
      const department =
        req.user.user_metadata?.department || req.user.department;

      // 🌟 FIX 2: Extract the student ID from the user object
      const studentId = req.user.id;

      const { year, batch } = req.query;

      if (!department) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Student profile is missing a department.",
          });
      }

      if (!year || !batch) {
        return res.status(400).json({
          success: false,
          error:
            "Please select your current Year and Batch from the dashboard to view assignments.",
        });
      }

      // 🌟 FIX 3: Pass studentId as the 4th argument!
      const assignments = await AssignmentRepository.getAssignmentsForStudent(
        department,
        year,
        batch,
        studentId,
      );

      return res.status(200).json({
        success: true,
        count: assignments.length,
        assignments: assignments,
      });
    } catch (error) {
      console.error("❌ [Assignment] Fetch Error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch assignments" });
    }
  },

  async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const assignment =
        await AssignmentRepository.getAssignmentForTestTaker(id);

      if (!assignment) {
        return res
          .status(404)
          .json({ success: false, error: "Assignment not found" });
      }

      // TIME-LOCK SECURITY
      const now = new Date();
      if (now < assignment.start_time) {
        return res.status(403).json({
          success: false,
          error: "This assignment has not started yet.",
        });
      }

      return res.status(200).json({ success: true, assignment });
    } catch (error) {
      console.error("❌ [Assignment] Fetch By ID Error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch assignment details" });
    }
  },

  // Add this inside AssignmentController
  async getSubmissionResult(req, res) {
    try {
      const { id } = req.params; // The Assignment ID
      const studentId = req.user.id;

      const submission = await SubmissionRepository.getStudentSubmissionResult(id, studentId);

      if (!submission) {
        return res.status(404).json({ success: false, error: "Submission not found." });
      }

      // 1. TIME-LOCK SECURITY
      const now = new Date();
      if (now < new Date(submission.assignment.release_marks_at)) {
        return res.status(403).json({ 
          success: false, 
          error: "Results are not released yet. Please check back later." 
        });
      }

      // 🌟 2. THE PLAGIARISM / QUARANTINE SHIELD (ADD THIS)
      if (submission.requires_review) {
        return res.status(200).json({ 
          success: true, 
          is_quarantined: true, // A special flag for the React frontend
          message: "Your submission has been flagged for review.",
          submission: {
            id: submission.id,
            assignment: { title: submission.assignment.title }
            // 🛑 NOTICE: We completely strip out the score, answers, and feedback here!
          }
        });
      }

      // 3. Normal response for honest students
      return res.status(200).json({ success: true, is_quarantined: false, submission });

    } catch (error) {
      console.error("❌ [Student Result] Fetch Error:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch results." });
    }
  }
};
