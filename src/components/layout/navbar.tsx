import React from "react"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { Home, Gamepad2, Users, Info, LogOut } from "lucide-react"

export function Navbar() {
  const { user, signOut } = useAuth()
  
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Local Game",
      link: "/local",
      icon: <Gamepad2 className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    ...(user ? [
      {
        name: "Dashboard",
        link: "/game",
        icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />,
      }
    ] : [
      {
        name: "Sign In",
        link: "/signin",
        icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />,
      }
    ])
  ]

  return (
    <FloatingNav 
      navItems={[
        ...navItems,
        ...(user ? [
          {
            name: <button onClick={signOut} className="text-sm hover:text-red-400 transition-colors flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>,
            link: "#",
            icon: <LogOut className="h-4 w-4 text-neutral-500 dark:text-white" />
          }
        ] : []),
        {
          name: <ModeToggle />,
          link: "#",
          icon: <ModeToggle />
        }
      ]}
    />
  )
}