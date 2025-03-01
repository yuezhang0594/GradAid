import "./App.css";
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './components/landing-page'
import { LoginForm } from './components/login-form'
import { Dashboard } from "./components/dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<div>Sign Up Page (Coming Soon)</div>} />
      </Routes>
    </>
  )
}

export default App;
