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
  Clock,
  Lock,
  Eye,
  Shuffle,
  Trophy,
  Users,
  Zap
} from "lucide-react";

const gameModes = [
  {
    id: "local",
    title: "Single Device (Pass & Play)",
    description: "Play on one device with friends around you. Perfect for parties and gatherings with privacy confirmation at each turn.",
    icon: <UsersIcon className="h-8 w-8 text-blue-500" />,
    features: [
      "3-20 players on one device",
      "Privacy confirmation system",
      "Word reminder with blur protection",
      "No internet required",
      "Instant setup",
      "Perfect for parties"
    ],
    status: "available",
    players: "3-20 players",
    duration: "10-30 minutes",
    href: "/local",
    color: "blue",
    highlights: [
      { icon: <Eye className="h-4 w-4" />, text: "Privacy Protection" },
      { icon: <Shuffle className="h-4 w-4" />, text: "Role Assignment" },
      { icon: <Trophy className="h-4 w-4" />, text: "Animated Scoreboard" }
    ]
  },
  {
    id: "multi-device",
    title: "Multi-Device Local",
    description: "Each player uses their own device while staying in the same room. Share room codes locally.",
    icon: <SmartphoneIcon className="h-8 w-8 text-purple-500" />,
    features: [
      "Private screens for each player",
      "6-digit room codes",
      "Local network play",
      "Individual word reminders",
      "Real-time sync",
      "Observer mode"
    ],
    status: "coming-soon",
    players: "3-15 players",
    duration: "15-45 minutes",
    href: "#",
    color: "purple",
    highlights: [
      { icon: <Users className="h-4 w-4" />, text: "Private Screens" },
      { icon: <Zap className="h-4 w-4" />, text: "Real-time Sync" },
      { icon: <Eye className="h-4 w-4" />, text: "Observer Mode" }
    ]
  },
  {
    id: "online",
    title: "Online Multiplayer",
    description: "Connect with friends worldwide through room codes. Full social features and persistent profiles.",
    icon: <GlobeIcon className="h-8 w-8 text-green-500" />,
    features: [
      "Play with friends anywhere",
      "Persistent user profiles",
      "Social features & stats",
      "Custom word packs",
      "AI-generated themes",
      "Leaderboards & badges"
    ],
    status: "coming-soon",
    players: "3-20 players",
    duration: "10-30 minutes",
    href: "#",
    color: "green",
    highlights: [
      { icon: <GlobeIcon className="h-4 w-4" />, text: "Global Play" },
      { icon: <Trophy className="h-4 w-4" />, text: "Leaderboards" },
      { icon: <Shuffle className="h-4 w-4" />, text: "AI Word Packs" }
    ]
  }
];

export function GameModesSection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  return (
    <section id="game-modes" className="py-8 sm:py-12 md:py-16 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Choose Your Game Mode
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Three ways to play Guess Who Now. Pick the mode that works best for your group and situation.
          </p>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              className="h-full"
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-2xl relative overflow-hidden ${
                hoveredMode === mode.id 
                  ? `border-2 border-${mode.color}-500 shadow-xl transform scale-105` 
                  : 'hover:shadow-lg border-gray-200 dark:border-gray-700'
              }`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${mode.color}-50/50 to-transparent dark:from-${mode.color}-900/20 dark:to-transparent opacity-0 transition-opacity duration-300 ${
                  hoveredMode === mode.id ? 'opacity-100' : ''
                }`} />
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 bg-${mode.color}-100 dark:bg-${mode.color}-900/30 rounded-xl`}>
                      {mode.icon}
                    </div>
                    <div className="text-right">
                      {mode.status === 'available' ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium">
                          Available Now
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 font-medium">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {mode.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      {mode.players}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mode.duration}
                    </div>
                  </div>
                  
                  <CardDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-0">
                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {mode.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className={`text-${mode.color}-500`}>
                            {highlight.icon}
                          </div>
                          <span>{highlight.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {mode.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className={`w-1.5 h-1.5 bg-${mode.color}-500 rounded-full mt-2 flex-shrink-0`}></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {mode.status === 'available' ? (
                      <Link href={mode.href} className="block">
                        <Button className={`w-full bg-gradient-to-r from-${mode.color}-500 to-${mode.color}-600 hover:from-${mode.color}-600 hover:to-${mode.color}-700 text-white font-semibold py-3 text-base transition-all duration-300 transform hover:scale-105`}>
                          <PlayIcon className="h-5 w-5 mr-2" />
                          Play Now
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed py-3 text-base">
                        <Lock className="h-5 w-5 mr-2" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎮 Start Playing Immediately
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Local multiplayer is ready to play right now! No sign-up required, no internet needed. 
              Just gather your friends and start the fun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/local">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Try Local Multiplayer
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Multi-device and Online modes launching soon!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}