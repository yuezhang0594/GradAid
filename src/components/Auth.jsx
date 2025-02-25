import { useState } from 'react'
import UserProfileForm from './UserProfileForm'
import authService from '../services/auth'

export default function Auth({ onBackClick }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const data = await authService.signUp(email, password, firstName, lastName);
        if (data.user) {
          await authService.signIn(email, password);
        }
        alert('Successfully signed up and logged in!');
      } else {
        await authService.signIn(email, password);
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.resetPassword(email);
      setResetSent(true)
      alert('Check your email for the password reset link')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true)
      await authService.signInWithProvider(provider);
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setResetSent(false)
  }

  const toggleMode = () => {
    resetForm()
    setIsSignUp(!isSignUp)
    setIsResetPassword(false)
  }

  const toggleResetPassword = () => {
    resetForm()
    setIsResetPassword(!isResetPassword)
    setIsSignUp(false)
  }

  if (showProfileForm) {
    return <UserProfileForm onComplete={() => setShowProfileForm(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {isResetPassword ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>
          <button
            onClick={onBackClick}
            className="text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        </div>

        <form onSubmit={isResetPassword ? handleResetPassword : handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {!isResetPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}
          <div>
            <button
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Loading...' : isResetPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        {!isResetPassword && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
                  />
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                  />
                </svg>
                Continue with GitHub
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col space-y-2 text-sm text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
          {!isSignUp && !isResetPassword && (
            <button
              type="button"
              onClick={toggleResetPassword}
              className="font-medium text-gray-600 hover:text-gray-500"
            >
              Forgot your password?
            </button>
          )}
          {isResetPassword && (
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(false)
                resetForm()
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
