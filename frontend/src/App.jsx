import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateAssignment from "./pages/CreateAssignment";
import TakeTest from "./pages/TakeTest";
import AssignmentView from "./pages/AssignmentView";
import SubmissionReview from "./pages/SubmissionReview";
import ResultsView from "./pages/ResultsView";
import GenerateQuestionsView from "./pages/GenerateQuestionsView";
import Home from "./pages/Home";

// Placeholders for subsequent views
// Role-Based Route Guards
const TeacherRoute = ({ children }) => {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-bg-secondary"></div>;
  if (!user || role !== "TEACHER") return <Navigate to="/auth" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-bg-secondary"></div>;
  if (!user || role !== "STUDENT") return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#2C2C2A",
              color: "#F1EFE8",
              border: "1px solid #444441",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.4)",
            },
            success: {
              iconTheme: { primary: "#5DCAA5", secondary: "#04342C" },
            },
            error: { iconTheme: { primary: "#D85A30", secondary: "#4A1B0C" } },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher-dashboard"
            element={
              <TeacherRoute>
                <TeacherDashboard />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/assignments/new"
            element={
              <TeacherRoute>
                <CreateAssignment />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/assignments/:id"
            element={
              <TeacherRoute>
                <AssignmentView />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/submissions/:submissionId"
            element={
              <TeacherRoute>
                <SubmissionReview />
              </TeacherRoute>
            }
          />
          <Route
            path="/teacher/generate-questions"
            element={
              <TeacherRoute>
                <GenerateQuestionsView />
              </TeacherRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />

          {/* <-- Updated Route using TakeTest --> */}
          <Route
            path="/student/assignments/:id"
            element={
              <StudentRoute>
                <TakeTest />
              </StudentRoute>
            }
          />

          <Route
            path="/student/results/:id"
            element={
              <StudentRoute>
                <ResultsView />
              </StudentRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
