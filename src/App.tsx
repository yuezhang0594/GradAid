import "./App.css";
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './app/components/landing-page';
import Dashboard from "./app/routes/dashboard/Dashboard";
import TOSPage from "./app/routes/legal/tos";
import PrivacyPolicy from "./app/routes/legal/privacy";
import ResendDashboard from "./app/routes/dev/ResendDashboard";
import ProtectedRoute from "./app/lib/ProtectedRoute";
import SignInPage from "./app/routes/auth/SignIn";
import SignUpPage from "./app/routes/auth/SignUp";
import SignOutPage from "./app/routes/auth/SignOut";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage redirectUrl={"/dashboard"} />} />
        <Route path="/signup" element={<SignUpPage redirectUrl={"/onboarding"} />} />
        <Route path="/signout" element={<SignOutPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><div>Onboarding</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div>Settings</div></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tos" element={<TOSPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/resend" element={<ProtectedRoute><ResendDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App;
