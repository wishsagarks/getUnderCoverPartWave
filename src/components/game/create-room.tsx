import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export function CreateRoom() {
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = async () => {
    setLoading(true)
    // TODO: Implement room creation with Supabase
    setTimeout(() => {
      setLoading(false)
      alert("Room creation will be implemented with Supabase integration!")
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
              Create New Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up your game room and invite friends to join
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Room Settings</CardTitle>
              <CardDescription>
                Configure your game room preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Online Multiplayer Coming Soon!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Room creation and online multiplayer features will be available once Supabase is configured.
                </p>
                <div className="space-y-3">
                  <Button className="w-full">
                    <Link to="/local">Play Local Multiplayer Instead</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleCreateRoom} disabled={loading}>
                    {loading ? "Creating..." : "Create Room (Demo)"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}