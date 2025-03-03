import "./App.css";
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './components/landing-page'
import LoginPage from './app/login/page'
import { Dashboard } from "./components/dashboard";
import SignupPage from "./app/signup/page";
import TOSPage from "./app/legal/tos";
import PrivacyPolicy from "./app/legal/privacy";
import ResendVerifyButton from "./auth/ResendVerifyButton";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tos" element={<TOSPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/resend" element={<ResendVerifyButton />} />
      </Routes>
    </>
  )
}

export default App;
