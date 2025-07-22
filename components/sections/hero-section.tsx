"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/aceternity/lamp";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Button } from "@/components/aceternity/button";
import { Badge } from "@/components/aceternity/badge";
import { 
  PlayIcon,
  UserPlusIcon,
  GlobeIcon,
  UsersIcon,
  ZapIcon,
  StarIcon
} from "@/components/aceternity/icons";

export function HeroSection() {
  return (
    <LampContainer className="pt-20 sm:pt-16 md:pt-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-0"
      >
        <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
          <Badge variant="secondary" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
            🎉 Now Live on Party Wave Platform
          </Badge>
        </div>

        <motion.h1 
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-slate-300 to-slate-500 py-2 md:py-4 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Guess Who Now
        </motion.h1>

        <TextGenerateEffect 
          words="The ultimate word deduction party game that brings friends together through clever clues, strategic thinking, and endless fun."
          className="text-base sm:text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8"
        />

        <motion.div 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/game">
            <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg w-full sm:w-auto">
              <PlayIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Start Playing Now
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-semibold border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
            <UserPlusIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
            <Link href="/signin">Join Game</Link>
          </Button>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-base sm:text-lg text-slate-300 dark:text-slate-400 font-medium mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 px-3 py-2 rounded-full backdrop-blur-sm">
            <GlobeIcon className="h-4 w-4 text-cyan-400" />
            <span>Play Anywhere</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 px-3 py-2 rounded-full backdrop-blur-sm">
            <UsersIcon className="h-4 w-4 text-blue-400" />
            <span>3-20 Players</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 px-3 py-2 rounded-full backdrop-blur-sm">
            <ZapIcon className="h-4 w-4 text-purple-400" />
            <span>Real-time Sync</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 px-3 py-2 rounded-full backdrop-blur-sm">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span>Free to Play</span>
          </div>
        </motion.div>
      </motion.div>
    </LampContainer>
  );
}