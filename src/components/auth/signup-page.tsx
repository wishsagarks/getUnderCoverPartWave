import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfigured) {
      setError("Supabase is not configured. Please set up your environment variables.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false) 
    //
    const { data, error } = await signUp(email, password, username)
    
    setLoading(false) // Stop loading indicator once the request is complete

    if (error) {
      // This catches explicit errors from Supabase (e.g., password too short, invalid email format).
      setError(error.message)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // THIS IS THE KEY FIX: Supabase returns a user with no identities if the email
      // is already registered but the user hasn't confirmed their email address.
      // We catch this specific case and show an appropriate message.
      setError("A user with this email already exists. Please sign in or check your inbox to confirm your account.")
    } else if (data.user) {
      // This is a successful sign-up. The user object is returned and identities are present.
      // NOTE: You might want to redirect to a "Please confirm your email" page here.
      setSuccess(true)
      setTimeout(() => navigate("/game"), 2000)
    } else {
      // Fallback for any other unexpected case where there's no error but no user data.
      setError("An unknown error occurred. Please try again.")
    }
    // ============================= FIX ENDS HERE =============================
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Setup Required</CardTitle>
            <CardDescription>
              Supabase configuration is required for online features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To use online multiplayer features, please configure your Supabase environment variables.
            </p>
            <Button className="w-full" asChild>
              <Link to="/local">Play Local Game Instead</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Welcome!</CardTitle>
            <CardDescription>
              Your account has been created. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join the party and play online multiplayer games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Choose a username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Or{" "}
                <Link to="/local" className="text-blue-600 hover:text-blue-500 font-medium">
                  play local multiplayer
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
