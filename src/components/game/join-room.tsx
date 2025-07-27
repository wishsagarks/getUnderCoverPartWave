import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export function JoinRoom() {
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement room joining with Supabase
    setTimeout(() => {
      setLoading(false)
      alert(`Joining room ${roomCode} will be implemented with Supabase integration!`)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <Button variant="ghost" className="mb-4">
              <Link to="/game" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a 6-digit room code to join an existing game
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter Room Code</CardTitle>
              <CardDescription>
                Ask your host for the 6-digit room code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="roomCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Room Code
                  </label>
                  <input
                    id="roomCode"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="000000"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the 6-digit code provided by your host
                  </p>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading || roomCode.length !== 6}>
                    {loading ? "Joining..." : "Join Room"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Link to="/local">Play Local Multiplayer Instead</Link>
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Online multiplayer features will be available once Supabase is configured.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}