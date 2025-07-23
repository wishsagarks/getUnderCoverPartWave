import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    step: 1,
    title: "Get Your Secret Word",
    description: "Each player receives a secret word. Most players get the same word (Civilians), but one player gets a different word (Undercover).",
    tip: "Keep your word secret! Use the 'Show My Word' button anytime to remind yourself."
  },
  {
    step: 2,
    title: "Give Clues",
    description: "Take turns giving one-word clues about your secret word. Be clever - help your team while staying hidden if you're undercover!",
    tip: "Good clues are specific enough to help civilians but vague enough to confuse the undercover player."
  },
  {
    step: 3,
    title: "Discuss & Vote",
    description: "After everyone gives clues, discuss who might be the undercover player. Then vote to eliminate someone.",
    tip: "Listen carefully to clues that don't quite fit. The undercover player might give themselves away!"
  },
  {
    step: 4,
    title: "Win the Game",
    description: "Civilians win by finding the undercover player. Undercover wins by surviving until the end or correctly guessing the civilian word.",
    tip: "Strategy matters! Sometimes it's better to lay low, sometimes you need to be bold."
  }
]

export function HowToPlaySection() {
  return (
    <section id="how-to-play" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Play
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Master the art of deduction in 4 simple steps. Easy to learn, impossible to master!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </Badge>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      💡 Pro Tip: {step.tip}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}