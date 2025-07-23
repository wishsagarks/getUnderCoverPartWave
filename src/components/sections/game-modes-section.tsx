import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Smartphone, Wifi, Globe, Users, Clock, Lock } from "lucide-react"

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
    <section id="game-modes" className="py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Game Mode
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From intimate pass-and-play sessions to global online tournaments. 
            Pick the perfect mode for your group and occasion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                mode.status === 'available' 
                  ? 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <CardHeader className="text-center pb-4">
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      mode.status === 'available'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <mode.icon className="w-8 h-8 text-white" />
                    </div>
                    {mode.status === 'coming-soon' && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      >
                        Coming Soon
                      </Badge>
                    )}
                    {mode.status === 'available' && (
                      <Badge 
                        className="absolute -top-2 -right-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Available Now
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mb-2">{mode.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Quick Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{mode.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{mode.setupTime}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {mode.status === 'available' ? (
                      <Button className="w-full group-hover:shadow-lg transition-all duration-300">
                        <Link to={mode.link} className="flex items-center justify-center gap-2">
                          <span>Play Now</span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.div>
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full cursor-not-allowed opacity-60"
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
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Playing?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Jump into a local game right now, or sign up to get notified when online multiplayer launches!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <Link to="/local">Start Local Game</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Link to="/signin">Get Notified</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}