import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  EyeOff, 
  Play, 
  RotateCcw, 
  Trophy,
  Clock,
  Target,
  Shield,
  Zap
} from "lucide-react"

// Word packs data
const wordPacks = [
  {
    id: "general",
    title: "General Pack",
    description: "Basic words for everyday gameplay",
    difficulty: "Easy",
    pairs: [
      { civilian: "Apple", undercover: "Orange" },
      { civilian: "Cat", undercover: "Dog" },
      { civilian: "Coffee", undercover: "Tea" },
      { civilian: "Summer", undercover: "Winter" },
      { civilian: "Book", undercover: "Magazine" },
      { civilian: "Car", undercover: "Bike" },
      { civilian: "Pizza", undercover: "Burger" },
      { civilian: "Ocean", undercover: "Lake" },
      { civilian: "Phone", undercover: "Computer" },
      { civilian: "Rain", undercover: "Snow" }
    ]
  },
  {
    id: "technology",
    title: "Technology Pack",
    description: "Modern technology and gadgets",
    difficulty: "Medium",
    pairs: [
      { civilian: "iPhone", undercover: "Android" },
      { civilian: "Netflix", undercover: "YouTube" },
      { civilian: "Instagram", undercover: "TikTok" },
      { civilian: "Tesla", undercover: "BMW" },
      { civilian: "Zoom", undercover: "Teams" },
      { civilian: "WhatsApp", undercover: "Telegram" },
      { civilian: "Google", undercover: "Bing" },
      { civilian: "Spotify", undercover: "Apple Music" },
      { civilian: "Amazon", undercover: "Flipkart" },
      { civilian: "Facebook", undercover: "Twitter" }
    ]
  },
  {
    id: "indian-culture",
    title: "Indian Culture Pack",
    description: "Words related to Indian culture and traditions",
    difficulty: "Medium",
    pairs: [
      { civilian: "Dosa", undercover: "Idli" },
      { civilian: "Bollywood", undercover: "Hollywood" },
      { civilian: "Cricket", undercover: "Football" },
      { civilian: "Holi", undercover: "Diwali" },
      { civilian: "Taj Mahal", undercover: "Red Fort" },
      { civilian: "Biryani", undercover: "Pulao" },
      { civilian: "Sari", undercover: "Lehenga" },
      { civilian: "Mumbai", undercover: "Delhi" },
      { civilian: "Ganesh", undercover: "Krishna" },
      { civilian: "Samosa", undercover: "Pakora" }
    ]
  }
]

type GamePhase = 'setup' | 'privacy-check' | 'word-reveal' | 'clue-giving' | 'voting' | 'results' | 'final-results'
type PlayerRole = 'civilian' | 'undercover'

interface Player {
  id: number
  name: string
  role: PlayerRole
  word: string
  clue: string
  isAlive: boolean
  reminderCount: number
}

interface GameState {
  players: Player[]
  currentPlayerIndex: number
  phase: GamePhase
  round: number
  selectedWordPack: string
  wordPair: { civilian: string; undercover: string } | null
  votes: { [playerId: number]: number }
  eliminatedPlayer: Player | null
  winner: 'civilians' | 'undercover' | null
  gameStats: {
    totalRounds: number
    totalReminders: number
    eliminationOrder: Player[]
  }
}

export function LocalMultiplayer() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    phase: 'setup',
    round: 1,
    selectedWordPack: 'general',
    wordPair: null,
    votes: {},
    eliminatedPlayer: null,
    winner: null,
    gameStats: {
      totalRounds: 0,
      totalReminders: 0,
      eliminationOrder: []
    }
  })

  const [playerCount, setPlayerCount] = useState(6)
  const [showWord, setShowWord] = useState(false)
  const [clueInput, setClueInput] = useState("")
  const [selectedVote, setSelectedVote] = useState<number | null>(null)

  // Initialize game
  const startGame = () => {
    const selectedPack = wordPacks.find(pack => pack.id === gameState.selectedWordPack)!
    const randomPair = selectedPack.pairs[Math.floor(Math.random() * selectedPack.pairs.length)]
    
    // Create players
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      role: 'civilian',
      word: randomPair.civilian,
      clue: '',
      isAlive: true,
      reminderCount: 0
    }))

    // Assign undercover role to one random player
    const undercoverIndex = Math.floor(Math.random() * playerCount)
    players[undercoverIndex].role = 'undercover'
    players[undercoverIndex].word = randomPair.undercover

    setGameState(prev => ({
      ...prev,
      players,
      wordPair: randomPair,
      phase: 'privacy-check',
      currentPlayerIndex: 0
    }))
  }

  // Privacy check confirmation
  const confirmPrivacy = () => {
    setGameState(prev => ({ ...prev, phase: 'word-reveal' }))
  }

  // Show word and proceed
  const proceedFromWordReveal = () => {
    setShowWord(false)
    setGameState(prev => ({ ...prev, phase: 'clue-giving' }))
  }

  // Submit clue
  const submitClue = () => {
    if (!clueInput.trim()) return

    const updatedPlayers = [...gameState.players]
    updatedPlayers[gameState.currentPlayerIndex].clue = clueInput.trim()

    const nextPlayerIndex = gameState.currentPlayerIndex + 1
    const isLastPlayer = nextPlayerIndex >= gameState.players.filter(p => p.isAlive).length

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      currentPlayerIndex: isLastPlayer ? 0 : nextPlayerIndex,
      phase: isLastPlayer ? 'voting' : 'privacy-check'
    }))

    setClueInput("")
  }

  // Submit vote
  const submitVote = () => {
    if (selectedVote === null) return

    const newVotes = { ...gameState.votes }
    newVotes[gameState.currentPlayerIndex + 1] = selectedVote

    const nextPlayerIndex = gameState.currentPlayerIndex + 1
    const alivePlayers = gameState.players.filter(p => p.isAlive)
    const isLastVoter = nextPlayerIndex >= alivePlayers.length

    if (isLastVoter) {
      // Calculate elimination
      const voteCounts: { [playerId: number]: number } = {}
      Object.values(newVotes).forEach(vote => {
        voteCounts[vote] = (voteCounts[vote] || 0) + 1
      })

      const maxVotes = Math.max(...Object.values(voteCounts))
      const eliminatedId = parseInt(Object.keys(voteCounts).find(id => voteCounts[parseInt(id)] === maxVotes)!)
      const eliminatedPlayer = gameState.players.find(p => p.id === eliminatedId)!

      const updatedPlayers = gameState.players.map(p => 
        p.id === eliminatedId ? { ...p, isAlive: false } : p
      )

      // Check win conditions
      const aliveAfterElimination = updatedPlayers.filter(p => p.isAlive)
      const aliveCivilians = aliveAfterElimination.filter(p => p.role === 'civilian')
      const aliveUndercover = aliveAfterElimination.filter(p => p.role === 'undercover')

      let winner: 'civilians' | 'undercover' | null = null
      if (aliveUndercover.length === 0) {
        winner = 'civilians'
      } else if (aliveCivilians.length <= aliveUndercover.length) {
        winner = 'undercover'
      }

      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        votes: newVotes,
        eliminatedPlayer,
        winner,
        phase: winner ? 'final-results' : 'results',
        gameStats: {
          ...prev.gameStats,
          totalRounds: prev.round,
          eliminationOrder: [...prev.gameStats.eliminationOrder, eliminatedPlayer]
        }
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        votes: newVotes,
        currentPlayerIndex: nextPlayerIndex
      }))
    }

    setSelectedVote(null)
  }

  // Use word reminder
  const useReminder = () => {
    const updatedPlayers = [...gameState.players]
    updatedPlayers[gameState.currentPlayerIndex].reminderCount++

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      gameStats: {
        ...prev.gameStats,
        totalReminders: prev.gameStats.totalReminders + 1
      }
    }))

    setShowWord(true)
  }

  // Reset game
  const resetGame = () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      phase: 'setup',
      round: 1,
      selectedWordPack: 'general',
      wordPair: null,
      votes: {},
      eliminatedPlayer: null,
      winner: null,
      gameStats: {
        totalRounds: 0,
        totalReminders: 0,
        eliminationOrder: []
      }
    })
    setShowWord(false)
    setClueInput("")
    setSelectedVote(null)
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const alivePlayers = gameState.players.filter(p => p.isAlive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Local Multiplayer
          </h1>
          <div className="w-20" /> {/* Spacer */}
        </div>

        <AnimatePresence mode="wait">
          {/* Setup Phase */}
          {gameState.phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Game Setup</CardTitle>
                  <CardDescription>
                    Configure your local multiplayer game
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Player Count */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Number of Players: {playerCount}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={playerCount}
                      onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Choose Word Pack
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {wordPacks.map((pack) => (
                        <Card
                          key={pack.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            gameState.selectedWordPack === pack.id
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : ''
                          }`}
                          onClick={() => setGameState(prev => ({ ...prev, selectedWordPack: pack.id }))}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{pack.title}</CardTitle>
                              <Badge variant={pack.difficulty === 'Easy' ? 'default' : 'secondary'}>
                                {pack.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-xs mb-2">
                              {pack.description}
                            </CardDescription>
                            <div className="text-xs text-gray-500">
                              {pack.pairs.length} word pairs
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button onClick={startGame} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Privacy Check Phase */}
          {gameState.phase === 'privacy-check' && (
            <motion.div
              key="privacy-check"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl">Privacy Check</CardTitle>
                  <CardDescription>
                    Make sure only the correct player can see the screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-6xl">🔒</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Are you {currentPlayer?.name}?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only {currentPlayer?.name} should see their secret word. 
                      Make sure others are looking away!
                    </p>
                  </div>
                  <Button onClick={confirmPrivacy} className="w-full">
                    Yes, I'm {currentPlayer?.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Word Reveal Phase */}
          {gameState.phase === 'word-reveal' && (
            <motion.div
              key="word-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl">{currentPlayer?.name}</CardTitle>
                  <CardDescription>
                    Your secret word and role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-6 rounded-lg ${
                    currentPlayer?.role === 'civilian' 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {currentPlayer?.role === 'civilian' ? (
                        <Shield className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Target className="w-6 h-6 text-red-600" />
                      )}
                      <Badge className={
                        currentPlayer?.role === 'civilian' 
                          ? 'bg-blue-600' 
                          : 'bg-red-600'
                      }>
                        {currentPlayer?.role === 'civilian' ? 'Civilian' : 'Undercover'}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {showWord ? currentPlayer?.word : '***'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWord(!showWord)}
                      className="mb-4"
                    >
                      {showWord ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showWord ? 'Hide' : 'Show'} Word
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPlayer?.role === 'civilian' 
                      ? 'You are a Civilian. Give clues that help other civilians identify the undercover player.'
                      : 'You are Undercover! Try to blend in without revealing that you have a different word.'
                    }
                  </div>

                  <Button onClick={proceedFromWordReveal} className="w-full">
                    I've Memorized My Word
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Clue Giving Phase */}
          {gameState.phase === 'clue-giving' && (
            <motion.div
              key="clue-giving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">
                    {currentPlayer?.name}'s Turn
                  </CardTitle>
                  <CardDescription>
                    Give a one-word clue about your secret word
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="flex items-center justify-between text-sm">
                    <span>Round {gameState.round}</span>
                    <span>
                      {gameState.players.filter(p => p.clue).length} / {alivePlayers.length} clues given
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(gameState.players.filter(p => p.clue).length / alivePlayers.length) * 100}%` 
                      }}
                    />
                  </div>

                  {/* Word Reminder */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={useReminder}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Show My Word
                      {currentPlayer?.reminderCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {currentPlayer.reminderCount}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Clue Input */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      placeholder="Enter your one-word clue..."
                      className="w-full px-4 py-3 text-center text-xl border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      maxLength={20}
                    />
                    <Button 
                      onClick={submitClue} 
                      className="w-full" 
                      disabled={!clueInput.trim()}
                    >
                      Submit Clue
                    </Button>
                  </div>

                  {/* Previous Clues */}
                  {gameState.players.some(p => p.clue) && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Clues Given:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {gameState.players
                          .filter(p => p.clue && p.isAlive)
                          .map(player => (
                            <div key={player.id} className="flex justify-between text-sm">
                              <span>{player.name}:</span>
                              <span className="font-medium">{player.clue}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Voting Phase */}
          {gameState.phase === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Voting Time</CardTitle>
                  <CardDescription>
                    {currentPlayer?.name}, vote to eliminate someone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* All Clues */}
                  <div>
                    <h4 className="font-semibold mb-3">All Clues:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alivePlayers.map(player => (
                        <div 
                          key={player.id} 
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="font-medium">{player.name}:</span>
                          <span className="text-lg">{player.clue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vote Selection */}
                  <div>
                    <h4 className="font-semibold mb-3">Vote to Eliminate:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {alivePlayers
                        .filter(p => p.id !== currentPlayer?.id)
                        .map(player => (
                          <Button
                            key={player.id}
                            variant={selectedVote === player.id ? "default" : "outline"}
                            onClick={() => setSelectedVote(player.id)}
                            className="p-4 h-auto"
                          >
                            <div className="text-center">
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm opacity-75">"{player.clue}"</div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>

                  <Button 
                    onClick={submitVote} 
                    className="w-full" 
                    disabled={selectedVote === null}
                  >
                    Cast Vote
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Phase */}
          {gameState.phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Round Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-6xl">
                    {gameState.eliminatedPlayer?.role === 'undercover' ? '🎉' : '😔'}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {gameState.eliminatedPlayer?.name} was eliminated!
                    </h3>
                    <Badge className={
                      gameState.eliminatedPlayer?.role === 'civilian' 
                        ? 'bg-blue-600' 
                        : 'bg-red-600'
                    }>
                      {gameState.eliminatedPlayer?.role === 'civilian' ? 'Civilian' : 'Undercover'}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Their word was: <strong>{gameState.eliminatedPlayer?.word}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">Civilians Remaining</div>
                      <div className="text-2xl text-blue-600">
                        {alivePlayers.filter(p => p.role === 'civilian').length}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Undercover Remaining</div>
                      <div className="text-2xl text-red-600">
                        {alivePlayers.filter(p => p.role === 'undercover').length}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setGameState(prev => ({ 
                      ...prev, 
                      phase: 'privacy-check',
                      currentPlayerIndex: 0,
                      round: prev.round + 1,
                      votes: {},
                      eliminatedPlayer: null
                    }))}
                    className="w-full"
                  >
                    Continue Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Final Results Phase */}
          {gameState.phase === 'final-results' && (
            <motion.div
              key="final-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">Game Over!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-8xl">
                    {gameState.winner === 'civilians' ? '🏆' : '🎭'}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      {gameState.winner === 'civilians' ? 'Civilians Win!' : 'Undercover Wins!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {gameState.winner === 'civilians' 
                        ? 'The civilians successfully identified and eliminated the undercover player!'
                        : 'The undercover player survived and outnumbered the civilians!'
                      }
                    </p>
                  </div>

                  {/* Game Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">Rounds</div>
                      <div className="text-xl">{gameState.gameStats.totalRounds}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">Reminders</div>
                      <div className="text-xl">{gameState.gameStats.totalReminders}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">Players</div>
                      <div className="text-xl">{gameState.players.length}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">Winner</div>
                      <div className="text-sm">
                        {gameState.winner === 'civilians' ? 'Civilians' : 'Undercover'}
                      </div>
                    </div>
                  </div>

                  {/* Elimination Order */}
                  <div>
                    <h4 className="font-semibold mb-3">Elimination Order:</h4>
                    <div className="space-y-2">
                      {gameState.gameStats.eliminationOrder.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between text-sm">
                          <span>#{index + 1} {player.name}</span>
                          <Badge className={
                            player.role === 'civilian' ? 'bg-blue-600' : 'bg-red-600'
                          }>
                            {player.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={resetGame} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Link to="/">Back to Home</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word Reminder Modal */}
        <AnimatePresence>
          {showWord && gameState.phase === 'clue-giving' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowWord(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">👁️</div>
                  <h3 className="text-xl font-semibold mb-2">Your Word</h3>
                  <div className={`text-3xl font-bold p-4 rounded-lg mb-4 ${
                    currentPlayer?.role === 'civilian' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' 
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {currentPlayer?.word}
                  </div>
                  <Badge className={
                    currentPlayer?.role === 'civilian' ? 'bg-blue-600' : 'bg-red-600'
                  }>
                    {currentPlayer?.role === 'civilian' ? 'Civilian' : 'Undercover'}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Tap anywhere to close
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}