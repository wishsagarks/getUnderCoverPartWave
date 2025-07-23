import React from "react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GW</span>
              </div>
              <span className="text-xl font-bold">Guess Who Now</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The ultimate word deduction party game. Bring friends together through clever clues, 
              strategic thinking, and endless fun.
            </p>
            <p className="text-sm text-gray-500">
              Part of the Party Wave Platform - Your destination for multiplayer party games.
            </p>
          </div>

          {/* Game Modes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Game Modes</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/local" className="hover:text-white transition-colors">
                  Local Multiplayer
                </Link>
              </li>
              <li className="text-gray-600">Online Multiplayer (Coming Soon)</li>
              <li className="text-gray-600">Mobile Party Mode (Coming Soon)</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#how-to-play" className="hover:text-white transition-colors">
                  How to Play
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li className="text-gray-600">FAQ (Coming Soon)</li>
              <li className="text-gray-600">Contact (Coming Soon)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Party Wave Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}