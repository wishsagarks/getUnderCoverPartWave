import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function GameRoom() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Game Room</CardTitle>
              <CardDescription>
                Online multiplayer game room coming soon!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                This feature will be implemented with Supabase real-time functionality.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}