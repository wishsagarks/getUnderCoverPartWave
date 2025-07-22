"use client";

import React from "react";
import { Timeline } from "@/components/aceternity/timeline";

const timelineData = [
  {
    title: "Create or Join Room",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-medium mb-8 leading-relaxed">
          Start a new game with a 6-digit room code or join an existing one. Share the code with your friends to get everyone connected instantly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-blue-800 dark:text-blue-300 font-bold text-lg mb-3">🎮 Host a Game</h4>
            <p className="text-blue-600 dark:text-blue-400 text-base font-medium">Create a room and get your unique 6-digit code</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-purple-800 dark:text-purple-300 font-bold text-lg mb-3">👥 Join Friends</h4>
            <p className="text-purple-600 dark:text-purple-400 text-base font-medium">Enter the room code to join the fun</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Get Your Role",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-medium mb-8 leading-relaxed">
          Receive your secret role and word. Keep it hidden from other players! You might be a civilian with the common word, or an undercover agent with a different word.
        </p>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-800/30 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-amber-800 dark:text-amber-300 font-bold text-lg mb-3">🤫 Keep It Secret!</h4>
          <p className="text-amber-700 dark:text-amber-400 text-base font-medium">Your role and word are your most valuable assets. Don't let anyone see your screen!</p>
        </div>
      </div>
    ),
  },
  {
    title: "Give Clues",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-medium mb-8 leading-relaxed">
          Take turns giving one-word clues related to your word without being too obvious. Be creative but careful - you don't want to give yourself away!
        </p>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 p-6 rounded-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-green-800 dark:text-green-300 font-bold text-lg mb-3">✅ Good Clue</h4>
            <p className="text-green-600 dark:text-green-400 text-base font-medium">Related but not too obvious</p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/30 p-6 rounded-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-red-800 dark:text-red-300 font-bold text-lg mb-3">❌ Bad Clue</h4>
            <p className="text-red-600 dark:text-red-400 text-base font-medium">Too obvious or completely unrelated</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Vote & Eliminate",
    content: (
      <div>
        <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-medium mb-8 leading-relaxed">
          Discuss and vote to eliminate players you think are the undercover agents. Use your detective skills to identify who doesn't belong!
        </p>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-indigo-800 dark:text-indigo-300 font-bold text-lg mb-4">🕵️ Strategy Tips</h4>
          <ul className="text-indigo-700 dark:text-indigo-400 text-base font-medium space-y-3">
            <li>• Listen carefully to everyone's clues</li>
            <li>• Look for patterns and inconsistencies</li>
            <li>• Don't be too aggressive early on</li>
            <li>• Trust your instincts but verify with evidence</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export function HowToPlaySection() {
  return (
    <section id="how-to-play">
      <Timeline data={timelineData} />
    </section>
  );
}