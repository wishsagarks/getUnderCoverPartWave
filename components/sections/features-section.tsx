"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/aceternity/card";
import { 
  UsersIcon, 
  BrainIcon, 
  SmartphoneIcon, 
  ShieldIcon, 
  ZapIcon, 
  TrophyIcon 
} from "@/components/aceternity/icons";

const features = [
  {
    icon: <UsersIcon className="h-8 w-8 text-blue-500" />,
    title: "Multiple Game Modes",
    description: "Play on a single device, multiple devices locally, or online with friends worldwide."
  },
  {
    icon: <BrainIcon className="h-8 w-8 text-purple-500" />,
    title: "AI-Powered Word Packs",
    description: "Enjoy curated word packs or create custom ones with our AI-powered generation system."
  },
  {
    icon: <SmartphoneIcon className="h-8 w-8 text-green-500" />,
    title: "Mobile Optimized",
    description: "Seamless experience across all devices with responsive design and touch-friendly controls."
  },
  {
    icon: <ShieldIcon className="h-8 w-8 text-red-500" />,
    title: "Privacy First",
    description: "Your data is secure with end-to-end encryption and privacy-focused design principles."
  },
  {
    icon: <ZapIcon className="h-8 w-8 text-yellow-500" />,
    title: "Real-time Sync",
    description: "Lightning-fast real-time synchronization keeps everyone in the game without delays."
  },
  {
    icon: <TrophyIcon className="h-8 w-8 text-orange-500" />,
    title: "Social Features",
    description: "Track stats, earn badges, and share your victories with integrated social features."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-6 sm:py-8 md:py-12 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Why Choose Guess Who Now?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the perfect blend of strategy, social interaction, and cutting-edge technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}