import "./App.css";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/landing-page";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Dashboard from "./routes/dev/Dashboard_statCard";
import TOSPage from "./routes/legal/tos";
import PrivacyPolicy from "./routes/legal/privacy";
import ResendDashboard from "./routes/dev/ResendDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignInPage from "./routes/auth/SignIn";
import SignUpPage from "./routes/auth/SignUp";
import SignOutPage from "./routes/auth/SignOut";
import ApplicationDetail from "./routes/dev/ApplicationDetail";
import DocumentEditor from "./routes/dev/DocumentEditor";

// Import your page components
import ApplicationsPage from "./routes/cards/applications";
import DocumentsPage from "./routes/cards/documents";
import TimelinePage from "./routes/cards/timeline";
import CreditsPage from "./routes/cards/credits";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/signin"
          element={<SignInPage redirectUrl={"/dashboard"} />}
        />
        <Route
          path="/signup"
          element={<SignUpPage redirectUrl={"/onboarding"} />}
        />
        <Route path="/signout" element={<SignOutPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <div>Onboarding</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div>Settings</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:universityId"
          element={
            <ProtectedRoute>
              <ApplicationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:universityId/documents/:documentId"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />

        <Route path="/tos" element={<TOSPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/resend"
          element={
            <ProtectedRoute>
              <ResendDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
