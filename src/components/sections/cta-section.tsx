import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Link } from "react-router-dom"
import { Play, Users, Sparkles, Zap } from "lucide-react"

export function CTASection() {
  return (
    <section id="cta" className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <BackgroundBeams />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute -top-4 -right-4 text-yellow-400"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Ready to Start the Fun?
            </h2>
          </div>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of players who are already enjoying the ultimate word deduction experience. 
            <span className="text-cyan-300 font-semibold">No downloads, no waiting</span> - just pure party game fun!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl border-0 group"
              >
                <Link to="/local" className="flex items-center gap-2">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Play Local Game
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm group"
              >
                <Link to="/signin" className="flex items-center gap-2">
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create Account
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center justify-center gap-4 text-slate-400 text-sm mt-8"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span>Local multiplayer requires no account</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Online features with Supabase</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}