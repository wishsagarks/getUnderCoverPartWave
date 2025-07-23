import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Meteors } from "@/components/ui/meteors"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Link } from "react-router-dom"
import { Smartphone, Wifi, Globe, Users, Clock, Lock, Sparkles, Zap, Star } from "lucide-react"

const gameModes = [
  {
    id: "single-device",
    title: "Single Device (Pass & Play)",
    description: "Perfect for intimate gatherings. One device passed around with privacy confirmations.",
    icon: Smartphone,
    status: "available",
    features: [
      "3-20 players on one device",
      "Privacy confirmation system",
      "Word reminder with usage tracking",
      "Complete offline gameplay"
    ],
    difficulty: "Easy",
    setupTime: "30 seconds",
    link: "/local"
  },
  {
    id: "multi-device-local",
    title: "Multi-Device Local",
    description: "Each player uses their own device, connected via local network or room codes.",
    icon: Wifi,
    status: "coming-soon",
    features: [
      "Each player on own device",
      "Local network connection",
      "Real-time synchronization",
      "Enhanced privacy"
    ],
    difficulty: "Medium",
    setupTime: "2 minutes",
    link: "#"
  },
  {
    id: "online-multiplayer",
    title: "Online Multiplayer",
    description: "Play with friends anywhere in the world. Full social features and matchmaking.",
    icon: Globe,
    status: "coming-soon",
    features: [
      "Global multiplayer",
      "Friend system",
      "Ranked matches",
      "Custom tournaments"
    ],
    difficulty: "Easy",
    setupTime: "1 minute",
    link: "#"
  }
]

export function GameModesSection() {
  return (
    <section id="game-modes" className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.3)" />
      <BackgroundBeams />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 text-yellow-400"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Choose Your Game Mode
            </h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            From intimate pass-and-play sessions to global online tournaments. 
            Pick the perfect mode for your group and occasion.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className={`h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 relative overflow-hidden ${
                mode.status === 'available' 
                  ? 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white/80 dark:bg-gray-800/80' 
                  : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60'
              } backdrop-blur-xl`}>
                <Meteors number={15} />
                
                <CardHeader className="text-center pb-4">
                  <div className="relative mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-2xl ${
                      mode.status === 'available'
                        ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                    >
                      <mode.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    {mode.status === 'coming-soon' && (
                      <Badge 
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg animate-pulse"
                      >
                        Coming Soon
                      </Badge>
                    )}
                    {mode.status === 'available' && (
                      <Badge 
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Available Now
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {mode.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 relative z-10">
                  {/* Quick Stats */}
                  <div className="flex justify-between items-center text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{mode.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{mode.setupTime}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {mode.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {mode.status === 'available' ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <Link to={mode.link} className="flex items-center justify-center gap-2">
                          <span>Play Now</span>
                          <motion.div
                            animate={{ x: [0, 6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap className="w-4 h-4" />
                          </motion.div>
                        </Link>
                        </Button>
                      </motion.div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full cursor-not-allowed opacity-60 border-gray-300 dark:border-gray-600"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20 relative z-10"
        >
          <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl p-10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <motion.h3 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Ready to Start Playing?
            </motion.h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Jump into a local game right now, or sign up to get notified when online multiplayer launches!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                <Link to="/local">Start Local Game</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                <Link to="/signin">Get Notified</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}