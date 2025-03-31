import "./App.css";
import { Routes, Route } from "react-router-dom";
import { UserProfile } from "@clerk/clerk-react";
import { LandingPage } from "./components/landing-page";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./routes/dev/Dashboard_statCard";
import TOSPage from "./routes/legal/tos";
import PrivacyPolicy from "./routes/legal/privacy";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignInPage from "./routes/auth/SignIn";
import SignUpPage from "./routes/auth/SignUp";
import SignOutPage from "./routes/auth/SignOut";
import ApplicationsPage from "./routes/cards/applications";
import DocumentsPage from "./routes/cards/documents";
import ApplicationDetail from "./routes/dev/ApplicationDetail";
import DocumentEditor from "./routes/dev/DocumentEditor";
import TimelinePage from "./routes/cards/timeline";
import CreditsPage from "./routes/cards/credits";
import ActivityPage from "./routes/cards/activity";
import ProgramSearchPage from "./routes/ProgramSearchPage";
import OnboardingPage from "./routes/onboarding/page";
import ProfilePage from "./routes/profile/page";
import SavedProgramsPage from "./routes/SavedProgramsPage";
import ProgramApplyPage from "./routes/ProgramApplyPage";

function App() {
  return (
    <>
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
          <Route path="/applications/:universityName" element={<ApplicationDetail />} />
          <Route path="/applications/:universityName/documents" element={<DocumentsPage />} />
          <Route
            path="/applications/:universityName/documents/:documentType"
            element={<DocumentEditor />}
          />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
