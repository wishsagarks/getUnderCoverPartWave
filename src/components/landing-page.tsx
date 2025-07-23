import React from "react"
import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { GameModesSection } from "@/components/sections/game-modes-section"
import { HowToPlaySection } from "@/components/sections/how-to-play-section"
import { CTASection } from "@/components/sections/cta-section"
import { Footer } from "@/components/layout/footer"

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GameModesSection />
      <HowToPlaySection />
      <CTASection />
      <Footer />
    </div>
  )
}