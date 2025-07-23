import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Meteors } from "@/components/ui/meteors"
import { Users, Zap, Shield, Gamepad2 } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "3-20 Players",
    description: "Perfect for small groups or large parties. Flexible player count adapts to your group size."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "No downloads, no accounts required for local play. Just open and start playing immediately."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your secret words stay secret. Built-in privacy confirmations for pass-and-play mode."
  },
  {
    icon: Gamepad2,
    title: "Multiple Modes",
    description: "Single device, multi-device local, or online multiplayer. Play however works best for you."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Guess Who Now?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Designed for maximum fun with minimum friction. Get your party started in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <Meteors number={20} />
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}