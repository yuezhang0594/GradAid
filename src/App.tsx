import "./App.css";
import { Routes, Route } from "react-router-dom";
import { UserProfile } from "@clerk/clerk-react";
import { LandingPage } from "./components/landing-page";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./routes/dashboard/Dashboard";
import TOSPage from "./routes/legal/tos";
import PrivacyPolicy from "./routes/legal/privacy";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignInPage from "./routes/auth/SignIn";
import SignUpPage from "./routes/auth/SignUp";
import SignOutPage from "./routes/auth/SignOut";
import ApplicationsPage from "./routes/applications/applications";
import DocumentsPage from "./routes/pages/documents";
import ApplicationDetail from "./routes/applications/ApplicationDetail";
import DocumentEditor from "./routes/applications/DocumentEditor";
import TimelinePage from "./routes/pages/timeline";
import ActivityPage from "./routes/pages/activity";
import ProgramSearchPage from "./routes/ProgramSearchPage";
import OnboardingPage from "./routes/onboarding/page";
import ProfilePage from "./routes/profile/page";
import SavedProgramsPage from "./routes/SavedProgramsPage";
import ProgramApplyPage from "./routes/ProgramApplyPage";
import { Toaster } from "sonner";
import FeedbackPage from "./routes/FeedbackPage";

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage redirectUrl={"/dashboard"} />} />
        <Route path="/signup" element={<SignUpPage redirectUrl={"/onboarding"} />} />
        <Route path="/signout" element={<SignOutPage />} />
        <Route path="/clerk" element={<UserProfile />} />
        <Route path="/tos" element={<TOSPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute> <OnboardingPage /> </ProtectedRoute>} />
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<ProgramSearchPage />} />
          <Route path="/saved" element={<SavedProgramsPage />} />
          <Route path="/apply" element={<ProgramApplyPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/applications/:universityName" element={<ApplicationDetail />} />
          <Route path="/documents/:universityName" element={<DocumentsPage />} />
          <Route
            path="/documents/:universityName/:documentType"
            element={<DocumentEditor />}
          />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
