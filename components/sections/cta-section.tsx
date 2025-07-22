"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { Button } from "@/components/aceternity/button";
import { PlayIcon, UserPlusIcon } from "@/components/aceternity/icons";

export function CTASection() {
  return (
    <section id="cta" className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-800 relative overflow-hidden">
      <BackgroundBeams className="opacity-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Start the Fun?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto mb-6 sm:mb-8">
            Join thousands of players already enjoying the most engaging word deduction game ever created.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button size="lg" className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg w-full sm:w-auto">
              <PlayIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Play Now - It's Free!
            </Button>
            <Button size="lg" variant="outline" className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold border-white/80 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm w-full sm:w-auto">
              <UserPlusIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              <Link href="/signin">Create Account</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}