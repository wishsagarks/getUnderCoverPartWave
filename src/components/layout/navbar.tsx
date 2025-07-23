import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { Home, Gamepad2, Users, Info } from "lucide-react"

export function Navbar() {
  const { user, signOut, isConfigured } = useAuth()
  
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Play Local",
      link: "/local",
      icon: <Gamepad2 className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Multiplayer",
      link: user ? "/game" : "/signin",
      icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "#features",
      icon: <Info className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ]

  return (
    <>
      <FloatingNav navItems={navItems} />
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1 sm:space-x-2"
            >
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">GW</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Guess Who Now
                </span>
              </Link>
            </motion.div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ModeToggle />
              
              {!isConfigured && (
                <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded">
                  Setup Required
                </span>
              )}
              
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {user.user_metadata?.username || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    Sign Out
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <Link to="/game">
                      <span className="hidden sm:inline">Play Now</span>
                      <span className="sm:hidden">Play</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    <Link to="/signin">
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">Sign In</span>
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <Link to="/local">
                      <span className="hidden sm:inline">Play Now</span>
                      <span className="sm:hidden">Play</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  )
}

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isConfigured && (
              <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded">
                Setup Required
              </span>
            )}
            
            {user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {user.user_metadata?.username || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Sign Out
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Link to="/game">
                    <span className="hidden sm:inline">Play Now</span>
                    <span className="sm:hidden">Play</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  <Link to="/signin">
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Sign In</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4"
                >
                  <Link to="/local">
                    <span className="hidden sm:inline">Play Now</span>
                    <span className="sm:hidden">Play</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}