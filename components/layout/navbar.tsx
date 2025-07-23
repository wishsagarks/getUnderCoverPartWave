"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/aceternity/button";
import { ThemeToggle } from "@/components/aceternity/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";


export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-1 sm:space-x-2"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">GW</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Guess Who Now
            </span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 font-medium"
            >
              Features
            </a>
            <a
              href="#game-modes"
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 font-medium"
            >
              Game Modes
            </a>
            <a
              href="#how-to-play"
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 font-medium"
            >
              How to Play
            </a>
            <a
              href="#cta"
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 font-medium"
            >
              Get Started
            </a>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {!isSupabaseConfigured ? (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                Setup Required
              </div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Sign Out
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Link href="/game">
                    <span className="hidden sm:inline">Play Now</span>
                    <span className="sm:hidden">Play</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  <Link href="/signin">
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Sign In</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Link href="/game">
                    <span className="hidden sm:inline">Play Now</span>
                    <span className="sm:hidden">Play</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}