import express from 'express';
import { TeacherController } from '../controllers/teacher.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTeacher } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth and role checks to EVERY route in this file
router.use(requireAuth, requireTeacher);

// 1. Get overview of all assignments
router.get('/dashboard', TeacherController.getDashboard);

// 2. Get specific assignment stats & list of students who submitted
router.get('/assignments/:id', TeacherController.getAssignmentView);

// 3. Review a specific student's full submission
router.get('/submissions/:submissionId', TeacherController.getSubmissionReview);

// 4. HITL Override: Teacher manually changes an AI grade
router.patch('/submissions/:submissionId/answers/:answerId/override', TeacherController.overrideGrade);

router.post('/generate-questions', TeacherController.generateExam);

export default router;