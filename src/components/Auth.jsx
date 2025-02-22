import { useState } from 'react'
import UserProfileForm from './UserProfileForm'
import { authService } from '../services/auth'

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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                GitHub
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
