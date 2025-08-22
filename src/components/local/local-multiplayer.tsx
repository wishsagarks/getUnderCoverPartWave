import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Smartphone, Users, Play, Info } from "lucide-react"

export function LocalMultiplayer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <Button variant="ghost" className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Local Multiplayer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your preferred local game mode
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pass and Play Mode */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Pass & Play</CardTitle>
                <CardDescription className="text-base">
                  One device, many players. Perfect for in-person gatherings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>3-20 players per game</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Info className="w-4 h-4" />
                    <span>No internet required</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Everyone shares a single phone</li>
                    <li>• Pass device for secret word reveals</li>
                    <li>• Take turns giving clues</li>
                    <li>• Vote to eliminate suspects</li>
                  </ul>
                </div>

                <Button className="w-full" size="lg">
                  <Link to="/local/single-device" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Pass & Play
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Multi-Device Mode (Coming Soon) */}
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm opacity-75">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Multi-Device Local</CardTitle>
                <CardDescription className="text-base">
                  Each player uses their own device via local network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>3-20 players per game</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Local WiFi required</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Each player on own device</li>
                    <li>• Enhanced privacy</li>
                    <li>• Real-time synchronization</li>
                    <li>• Better for larger groups</li>
                  </ul>
                </div>

                <Button variant="outline" className="w-full" size="lg" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Game Rules Preview */}
          <Card className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Quick Rules Overview</CardTitle>
              <CardDescription>
                The classic Undercover word deduction game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <h4 className="font-semibold mb-1">Civilians</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get the same word. Find and eliminate the undercover players.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎭</div>
                  <h4 className="font-semibold mb-1">Undercover</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a similar word. Blend in and survive to the end.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">❓</div>
                  <h4 className="font-semibold mb-1">Mr. White</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get no word. Improvise and guess the civilian word to win.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}