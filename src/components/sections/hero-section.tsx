import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LampContainer } from "@/components/ui/lamp"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <LampContainer>
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <BackgroundBeams />
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Guess Who Now
      </motion.h1>
      
      <TextGenerateEffect 
        words="The ultimate word deduction party game that brings friends together through clever clues, strategic thinking, and endless fun."
        className="text-center text-[40px] md:text-5xl lg:text-6xl"
      />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
          <Link to="/local">Play Local Game</Link>
        </Button>
        <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white">
          <Link to="/signin">Sign In to Play Online</Link>
        </Button>
      </div>
    </LampContainer>
  )
}