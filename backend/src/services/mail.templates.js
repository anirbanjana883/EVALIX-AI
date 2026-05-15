// backend/src/services/mail/mail.templates.js

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const signupTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #4F46E5;">Welcome to Evalix AI, ${name}! 🚀</h2>
    <p>Your account has been successfully created. You are now ready to experience the next generation of AI-powered education.</p>
    <p><strong>Next Step:</strong> Please log in and complete your profile (Year, Batch, and Roll Number) so your teachers can assign you targeted exams.</p>
    <a href="${FRONTEND_URL}/profile" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Complete Profile</a>
  </div>
`;

export const assignmentUploadTemplate = (assignmentTitle, teacherName, deadline) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #f59e0b;">📚 New Assignment Uploaded</h2>
    <p>Prof. <strong>${teacherName}</strong> has just uploaded a new assignment for your batch.</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="margin: 0; color: #111827;">${assignmentTitle}</h3>
      <p style="margin: 5px 0 0 0; color: #ef4444;"><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
    </div>
    <p>Log in to your dashboard to view the syllabus and details.</p>
    <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  </div>
`;

export const assignmentLiveTemplate = (assignmentTitle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #10b981;">🟢 Exam is Now Live!</h2>
    <p>The time lock for <strong>${assignmentTitle}</strong> has ended. The exam has officially started.</p>
    <p>You may now open the assignment, view the questions, and upload your answer sheets.</p>
    <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Start Exam Now</a>
  </div>
`;

export const submissionConfirmationTemplate = (assignmentTitle, score = null) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #3b82f6;">✅ Submission Received</h2>
    <p>You have successfully submitted your answers for <strong>${assignmentTitle}</strong>.</p>
    ${score !== null ? `<p><strong>Initial MCQ Score:</strong> ${score} points</p>` : `<p>Your descriptive answers have been sent to the AI Evaluation Pipeline. You will be notified when grading is complete.</p>`}
    <p>Great job! You can view your submission receipt in your dashboard.</p>
  </div>
`;