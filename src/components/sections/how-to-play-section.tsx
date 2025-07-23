import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Meteors } from "@/components/ui/meteors"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Eye, MessageCircle, Vote, Trophy, Lightbulb, Sparkles, Star, Zap } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: Eye,
    color: "from-blue-500 to-cyan-500",
    title: "Get Your Secret Word",
    description: "Each player receives a secret word. Most players get the same word (Civilians), but one player gets a different word (Undercover).",
    tip: "Keep your word secret! Use the 'Show My Word' button anytime to remind yourself."
  },
  {
    step: 2,
    icon: MessageCircle,
    color: "from-purple-500 to-pink-500",
    title: "Give Clues",
    description: "Take turns giving one-word clues about your secret word. Be clever - help your team while staying hidden if you're undercover!",
    tip: "Good clues are specific enough to help civilians but vague enough to confuse the undercover player."
  },
  {
    step: 3,
    icon: Vote,
    color: "from-orange-500 to-red-500",
    title: "Discuss & Vote",
    description: "After everyone gives clues, discuss who might be the undercover player. Then vote to eliminate someone.",
    tip: "Listen carefully to clues that don't quite fit. The undercover player might give themselves away!"
  },
  {
    step: 4,
    icon: Trophy,
    color: "from-green-500 to-emerald-500",
    title: "Win the Game",
    description: "Civilians win by finding the undercover player. Undercover wins by surviving until the end or correctly guessing the civilian word.",
    tip: "Strategy matters! Sometimes it's better to lay low, sometimes you need to be bold."
  }
]

export function HowToPlaySection() {
  return (
    <section id="how-to-play" className="relative py-20 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 overflow-hidden">
      <Spotlight className="-top-40 right-0 md:right-60 md:-top-20" fill="rgba(147, 51, 234, 0.3)" />
      <BackgroundBeams />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 text-yellow-400"
            >
              <Star className="w-10 h-10" />
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              How to Play
            </h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Master the art of deduction in 4 simple steps. Easy to learn, impossible to master!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 relative overflow-hidden group">
                <Meteors number={12} />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${step.color} shadow-2xl`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <Badge className={`px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r ${step.color} text-white shadow-lg`}>
                      {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6 relative z-10">
                  <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    {step.description}
                  </CardDescription>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`bg-gradient-to-r ${step.color} bg-opacity-10 dark:bg-opacity-20 p-4 rounded-xl border border-white/20 backdrop-blur-sm`}
                  >
                    <p className="text-sm font-medium flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong className="text-yellow-600 dark:text-yellow-400">Pro Tip:</strong> {step.tip}
                      </span>
                    </p>
                  </motion.div>
                  
                  {/* Progress indicator */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((num) => (
                        <div
                          key={num}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            num <= step.step 
                              ? `bg-gradient-to-r ${step.color}` 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Step {step.step} of 4
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16 relative z-10"
        >
          <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Ready to Master the Game?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Now that you know the rules, jump into a game and start practicing your deduction skills!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto">
                <Zap className="w-5 h-5" />
                Start Playing Now
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}