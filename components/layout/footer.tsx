"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="py-12 bg-gray-900 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Guess Who Now</h3>
          <p className="text-gray-400 mb-6">
            Part of the Party Wave Platform - Where indie games come to life.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
            © 2025 Party Wave Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}