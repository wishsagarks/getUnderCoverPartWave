import React from "react"
import { Navbar } from "./layout/navbar"
import { HeroSection } from "./sections/hero-section"
import { FeaturesSection } from "./sections/features-section"
import { GameModesSection } from "./sections/game-modes-section"
import { HowToPlaySection } from "./sections/how-to-play-section"
import { CTASection } from "./sections/cta-section"
import { Footer } from "./layout/footer"

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