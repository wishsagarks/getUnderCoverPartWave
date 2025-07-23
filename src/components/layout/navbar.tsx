import React from "react"
import { Link } from "react-router-dom"
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
    <FloatingNav 
      navItems={[
        ...navItems,
        {
          name: <ModeToggle />,
          link: "#",
          icon: <ModeToggle />
        },
        ...(user ? [
          {
            name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
            link: "/game",
            icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />
          },
          {
            name: "Sign Out",
            link: "#",
            icon: <Button variant="ghost" size="sm" onClick={signOut} className="text-xs">Sign Out</Button>
          }
        ] : [
          {
            name: "Sign In",
            link: "/signin",
            icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />
          }
        ])
      ]}
    />
  )
}