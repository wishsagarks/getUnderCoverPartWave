import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LampContainer } from "@/components/ui/lamp"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Meteors } from "@/components/ui/meteors"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react"

export function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfigured) {
      setError("Supabase is not configured. Please set up your environment variables.")
      return
    }

    setLoading(true)
    setError("")

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      navigate("/game")
    }
    
    setLoading(false)
  }

  if (!isConfigured) {
    return (
      <LampContainer>
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-50 w-full max-w-md mx-auto"
        >
          <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl">
            <Meteors number={20} />
            <CardHeader className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Setup Required</CardTitle>
              <CardDescription className="text-slate-300">
                Supabase configuration is required for online features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300 text-center">
                To use online multiplayer features, please configure your Supabase environment variables.
              </p>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                <Link to="/local">Play Local Game Instead</Link>
              </Button>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                <Link to="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </LampContainer>
    )
  }

  return (
    <LampContainer>
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <BackgroundBeams />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 w-full max-w-md mx-auto px-4"
      >
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          <Meteors number={30} />
          <CardHeader className="text-center relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="w-20 h-20 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Sign in to your account to play online multiplayer
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <p className="text-sm text-red-200 text-center">{error}</p>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-slate-300 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </form>
            
            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-slate-300">
                Don't have an account?{" "}
                <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-slate-300">
                Or{" "}
                <Link to="/local" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  play local multiplayer
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </LampContainer>
  )
}