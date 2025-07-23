import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function CTASection() {
  return (
    <section id="cta" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start the Fun?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of players who are already enjoying the ultimate word deduction experience. 
            No downloads, no waiting - just pure party game fun!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 border-white"
            >
              <Link to="/local">Play Local Game</Link>
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link to="/signin">Create Account</Link>
            </Button>
          </div>
          
          <p className="text-blue-200 text-sm">
            Local multiplayer requires no account • Online features coming soon
          </p>
        </motion.div>
      </div>
    </section>
  )
}