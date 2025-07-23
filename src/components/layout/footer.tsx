import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Github, Twitter, Mail, Heart, Gamepad2, Users, Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white font-bold text-sm">GW</span>
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  Guess Who Now
                </span>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-300 mb-6 max-w-md leading-relaxed"
            >
              The ultimate word deduction party game. Bring friends together through clever clues, 
              strategic thinking, and <span className="text-cyan-300 font-semibold">endless fun</span>.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-sm text-gray-400 mb-6"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>Part of the Party Wave Platform</span>
            </motion.div>
            
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex space-x-4"
            >
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Mail, href: "#", label: "Email" }
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Game Modes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              Game Modes
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/local" 
                  className="flex items-center gap-2 text-gray-300 hover:text-cyan-300 transition-colors group"
                >
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Local Multiplayer
                </Link>
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4" />
                Online Multiplayer (Available)
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <Gamepad2 className="w-4 h-4" />
                Mobile Party Mode (Coming Soon)
              </li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#how-to-play" className="text-gray-300 hover:text-pink-300 transition-colors">
                  How to Play
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-pink-300 transition-colors">
                  Features
                </a>
              </li>
              <li className="text-gray-500">FAQ (Coming Soon)</li>
              <li className="text-gray-500">Contact (Coming Soon)</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8 text-center relative z-10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 flex items-center gap-2">
              &copy; 2025 Party Wave Platform. Made with 
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              for party game lovers.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}