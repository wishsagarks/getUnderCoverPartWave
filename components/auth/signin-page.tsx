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
import { createClientComponentClient } from "@/lib/supabase";
import { 
  PlayIcon,
  UserPlusIcon,
  ZapIcon,
  ShieldIcon
} from "@/components/aceternity/icons";

export function SignInPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to sign in');
        return;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        router.push('/game');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
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