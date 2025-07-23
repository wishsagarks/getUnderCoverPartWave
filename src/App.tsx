import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { LandingPage } from '@/components/landing-page'
import { SignInPage } from '@/components/auth/signin-page'
import { SignUpPage } from '@/components/auth/signup-page'
import { GameDashboard } from '@/components/game/game-dashboard'
import { CreateRoom } from '@/components/game/create-room'
import { JoinRoom } from '@/components/game/join-room'
import { GameLobby } from '@/components/game/game-lobby'
import { GameRoom } from '@/components/game/game-room'
import { LocalMultiplayer } from '@/components/local/local-multiplayer'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white dark:bg-black">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/game" element={<GameDashboard />} />
          <Route path="/game/create" element={<CreateRoom />} />
          <Route path="/game/join" element={<JoinRoom />} />
          <Route path="/game/:roomCode" element={<GameLobby />} />
          <Route path="/local" element={<LocalMultiplayer />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App