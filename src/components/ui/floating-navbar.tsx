import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string | React.ReactNode
    link: string
    icon?: JSX.Element
  }[]
  className?: string
}) => {
  const [visible] = useState(true)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black/80 bg-white/80 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-2 items-center justify-center space-x-2 sm:space-x-4",
          className
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-4">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">GW</span>
          </div>
          <span className="hidden sm:block text-sm font-bold text-gray-900 dark:text-white">
            Guess Who Now
          </span>
        </Link>
        
        {navItems.map((navItem, idx) => (
          navItem.link === "#" ? (
            <div key={`item-${idx}`} className="flex items-center">
              {navItem.name}
            </div>
          ) : (
            <Link
            key={`link-${idx}`}
            to={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500 text-xs sm:text-sm px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block">{navItem.name}</span>
          </Link>
          )
        ))}
      </motion.div>
    </AnimatePresence>
  )
}