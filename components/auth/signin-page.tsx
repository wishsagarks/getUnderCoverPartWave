"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/aceternity/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/aceternity/card";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { ThemeToggle } from "@/components/aceternity/theme-toggle";
import { setAuthToken } from "@/lib/client-auth-helpers";
import { 
  PlayIcon,
  UserPlusIcon,
  ZapIcon,
  ShieldIcon
} from "@/components/aceternity/icons";

export function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (data.token) {
        setAuthToken(data.token);
        router.push('/game');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('Google sign-in coming soon! Please use email for now.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      <BackgroundBeams className="opacity-20" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">GW</span>
            </motion.div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              Guess Who Now
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Welcome Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-6"
          >
            <div className="space-y-4">
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome Back to the Game
              </motion.h1>
              
              <TextGenerateEffect 
                words="Sign in to continue your word deduction adventures and connect with friends worldwide."
                className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto lg:mx-0"
              />
            </div>

            {/* Feature Highlights */}
            <motion.div 
              className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <ZapIcon className="h-4 w-4 text-cyan-500" />
                <span>Instant Play</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <ShieldIcon className="h-4 w-4 text-green-500" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <PlayIcon className="h-4 w-4 text-purple-500" />
                <span>Save Progress</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <UserPlusIcon className="h-4 w-4 text-blue-500" />
                <span>Friend Lists</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Sign In Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Sign In
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600" />
                      <span>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
                    Sign up for free
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}