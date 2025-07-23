"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/aceternity/card";
import { Button } from "@/components/aceternity/button";
import { Badge } from "@/components/aceternity/badge";
import Link from "next/link";
import { 
  UsersIcon, 
  SmartphoneIcon, 
  GlobeIcon, 
  PlayIcon,
} from "@/components/aceternity/icons";
} from "@/components/aceternity/icons";
import { Clock, Lock } from "lucide-react";

const gameModes = [
  {
    id: "local",
    title: "Local Multiplayer",
    description: "Play on a single device with friends around you. Perfect for parties and gatherings.",
    icon: <UsersIcon className="h-8 w-8 text-blue-500" />,
    features: [
      "3-20 players on one device",
      "No internet required",
      "Instant setup",
      "Perfect for parties"
    ],
    status: "available",
    players: "3-20 players",
    duration: "10-30 minutes",
    href: "/local"
  },
  {
    id: "online",
    title: "Online Multiplayer",
    description: "Connect with friends worldwide through room codes. Real-time synchronization.",
    icon: <GlobeIcon className="h-8 w-8 text-green-500" />,
    features: [
      "Play with friends anywhere",
      "Real-time sync",
      "Room codes",
      "Voice chat ready"
    ],
    status: "coming-soon",
    players: "3-20 players",
    duration: "10-30 minutes",
    href: "/game"
  },
  {
    id: "mobile",
    title: "Mobile Party Mode",
    description: "Each player uses their own phone while staying in the same room.",
    icon: <SmartphoneIcon className="h-8 w-8 text-purple-500" />,
    features: [
      "Private screens",
      "QR code joining",
      "Vibration feedback",
      "Mobile optimized"
    ],
    status: "coming-soon",
    players: "3-15 players",
    duration: "15-45 minutes",
    href: "#"
  }
];

export function GameModesSection() {
  const [selectedMode, setSelectedMode] = useState("local");

  return (
    <section id="game-modes" className="py-6 sm:py-8 md:py-12 bg-white dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Choose Your Game Mode
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Multiple ways to play Guess Who Now. Pick the mode that works best for your group.
          </p>
        </motion.div>

        {/* Mode Selection Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedMode === mode.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Mode Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          {gameModes.map((mode) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className={selectedMode === mode.id ? 'lg:col-span-2' : 'hidden lg:block'}
            >
              <Card className={`h-full transition-all duration-300 ${
                selectedMode === mode.id 
                  ? 'border-2 border-blue-500 shadow-lg' 
                  : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {mode.icon}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {mode.title}
                          {mode.status === 'available' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Available Now
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                              Coming Soon
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <UsersIcon className="h-4 w-4" />
                            {mode.players}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {mode.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6">
                    {mode.description}
                  </CardDescription>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {mode.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      {mode.status === 'available' ? (
                        <Link href={mode.href}>
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Play {mode.title}
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                          <Lock className="h-4 w-4 mr-2" />
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Quick Overview Cards for Non-Selected Modes */}
          <div className="space-y-4">
            {gameModes.filter(mode => mode.id !== selectedMode).map((mode) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {React.cloneElement(mode.icon, { className: "h-5 w-5" })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {mode.title}
                          </h4>
                          {mode.status === 'available' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                              Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {mode.players} • {mode.duration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}