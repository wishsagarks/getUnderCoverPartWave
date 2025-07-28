import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Meteors } from "@/components/ui/meteors"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
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
  Zap,
  Settings,
  Crown,
  Sparkles,
  Timer,
  Vote,
  MessageCircle,
  Star,
  Award,
  Gamepad2,
  UserPlus,
  Shuffle,
  Share2,
  Home,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Volume2
} from "lucide-react"
import { SingleDeviceGame } from "@/components/local/single-device-game"
import { getWordPacks, saveGameConfig, LocalGameConfig, WordPack, getRandomAvatar, assignRolesAndWords, generateSpeakingOrder, calculateElimination, checkWinCondition } from "@/lib/supabase-local-game"

interface Player {
  id: string
  name: string
  avatar: string
  role: 'civilian' | 'undercover' | 'mrx'
  word?: string
  isEliminated: boolean
  isObserver: boolean
  score: number
  cluesGiven: string[]
  votesReceived: number
  badges: string[]
  hasVoted: boolean
}

interface GameStats {
  totalClues: number
  correctGuesses: number
  mrXWins: number
  civilianWins: number
  undercoverWins: number
  roundsPlayed: number
  mvpPlayer?: string
}

export function LocalMultiplayer() {
  // Game State
  const [gamePhase, setGamePhase] = useState<GamePhase>('host-config')
  const [config, setConfig] = useState<GameConfig>({
    playerCount: 6,
    undercoverCount: 1,
    mrXCount: 1,
    wordPackId: 'general',
    rounds: 3,
    spectatorVoting: false,
    minigamesEnabled: true,
    observerMode: true,
    discussionTimer: true,
    discussionTimeMinutes: 2,
    animatedScoreboard: true
  })
  
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [speakingOrder, setSpeakingOrder] = useState<string[]>([])
  const [votes, setVotes] = useState<{[playerId: string]: string}>({})
  const [eliminatedThisRound, setEliminatedThisRound] = useState<Player | null>(null)
  const [gameStats, setGameStats] = useState<GameStats>({
    totalClues: 0,
    correctGuesses: 0,
    mrXWins: 0,
    civilianWins: 0,
    undercoverWins: 0,
    roundsPlayed: 0
  })
  
  // UI State
  const [wordPacks, setWordPacks] = useState<WordPack[]>([])
  const [loading, setLoading] = useState(false)
  const [showWord, setShowWord] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(0)
  const [selectedVote, setSelectedVote] = useState<string>("")
  const [showPrivacyScreen, setShowPrivacyScreen] = useState(false)
  const [currentRevealPlayer, setCurrentRevealPlayer] = useState<Player | null>(null)

  // Host counters
  const [undercoverCount, setUndercoverCount] = useState(0)
  const [mrXCount, setMrXCount] = useState(0)

  // Load word packs on mount
  useEffect(() => {
    const loadWordPacks = async () => {
      try {
        const packs = await getWordPacks()
        setWordPacks(packs)
      } catch (error) {
        console.error('Failed to load word packs:', error)
      }
    }
    loadWordPacks()
  }, [])

  // Discussion timer
  useEffect(() => {
    if (discussionTimeLeft > 0 && gamePhase === 'discussion-phase') {
      const timer = setTimeout(() => {
        setDiscussionTimeLeft(discussionTimeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (discussionTimeLeft === 0 && gamePhase === 'discussion-phase') {
      // Auto-proceed to voting when timer ends
      setGamePhase('voting-phase')
      setCurrentPlayerIndex(0)
    }
  }, [discussionTimeLeft, gamePhase])

  // PHASE 1: HOST CONFIGURATION
  const startPlayerOnboarding = async () => {
    setLoading(true)
    try {
      // Save config to Supabase
      const gameConfig: LocalGameConfig = {
        id: crypto.randomUUID(),
        ...config,
        createdAt: new Date().toISOString()
      }
      await saveGameConfig(gameConfig)
      setGamePhase('player-onboarding')
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setLoading(false)
    }
  }

  // PHASE 2: PLAYER ONBOARDING
  const addPlayer = () => {
    if (players.length >= config.playerCount || !currentInput.trim()) return

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: currentInput.trim(),
      avatar: getRandomAvatar(),
      role: 'civilian',
      isEliminated: false,
      isObserver: false,
      score: 0,
      cluesGiven: [],
      votesReceived: 0,
      badges: [],
      hasVoted: false
    }

    setPlayers([...players, newPlayer])
    setCurrentInput("")
  }

  const startRoleAssignment = async () => {
    setLoading(true)
    try {
      // Assign roles and words
      const playersWithRoles = await assignRolesAndWords(players, config)
      setPlayers(playersWithRoles)
      
      // Generate speaking order (Mr. X never first)
      const order = generateSpeakingOrder(playersWithRoles)
      setSpeakingOrder(order)
      
      setGamePhase('role-assignment')
      setCurrentPlayerIndex(0)
      setCurrentRevealPlayer(playersWithRoles[0])
      setShowPrivacyScreen(true)
      
      // Initialize counters for host
      setUndercoverCount(0)
      setMrXCount(0)
    } catch (error) {
      console.error('Failed to assign roles:', error)
    } finally {
      setLoading(false)
    }
  }

  // PHASE 3: ROLE & WORD ASSIGNMENT (Private Reveal)
  const proceedToNextReveal = () => {
    // Update counters for host based on current player's role
    if (currentRevealPlayer) {
      if (currentRevealPlayer.role === 'undercover') {
        setUndercoverCount(prev => prev + 1)
      } else if (currentRevealPlayer.role === 'mrx') {
        setMrXCount(prev => prev + 1)
      }
    }
    
    if (currentPlayerIndex < players.length - 1) {
      const nextIndex = currentPlayerIndex + 1
      setCurrentPlayerIndex(nextIndex)
      setCurrentRevealPlayer(players[nextIndex])
      setShowPrivacyScreen(true)
      setShowWord(false)
    } else {
      // All players revealed, start clue phase
      setGamePhase('clue-phase')
      setCurrentPlayerIndex(0)
      setShowPrivacyScreen(false)
      setCurrentRevealPlayer(null)
    }
  }

  // PHASE 4A: CLUE PHASE
  const submitClue = () => {
    if (!currentInput.trim()) return

    const speakingPlayerId = speakingOrder[currentPlayerIndex]
    const updatedPlayers = players.map(p => 
      p.id === speakingPlayerId 
        ? { ...p, cluesGiven: [...p.cluesGiven, currentInput.trim()] }
        : p
    )
    
    setPlayers(updatedPlayers)
    setGameStats(prev => ({ ...prev, totalClues: prev.totalClues + 1 }))
    setCurrentInput("")

    // Move to next player or next phase
    if (currentPlayerIndex < speakingOrder.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    } else {
      // All players gave clues
      if (config.discussionTimer) {
        setGamePhase('discussion-phase')
        setDiscussionTimeLeft(config.discussionTimeMinutes * 60)
      } else {
        setGamePhase('voting-phase')
        setCurrentPlayerIndex(0)
      }
    }
  }

  // PHASE 4C: VOTING PHASE
  const submitVote = () => {
    if (!selectedVote) return

    const alivePlayers = players.filter(p => !p.isEliminated)
    const votingPlayer = alivePlayers[currentPlayerIndex]
    
    const newVotes = { ...votes, [votingPlayer.id]: selectedVote }
    setVotes(newVotes)
    setSelectedVote("")

    // Update player as having voted
    const updatedPlayers = players.map(p => 
      p.id === votingPlayer.id ? { ...p, hasVoted: true } : p
    )
    setPlayers(updatedPlayers)

    // Check if all alive players have voted
    if (Object.keys(newVotes).length >= alivePlayers.length) {
      // Process elimination
      const eliminatedPlayer = calculateElimination(newVotes, players)
      if (eliminatedPlayer) {
        setEliminatedThisRound(eliminatedPlayer)
        
        // Mark player as eliminated
        const finalPlayers = players.map(p => 
          p.id === eliminatedPlayer.id ? { ...p, isEliminated: true } : p
        )
        setPlayers(finalPlayers)
        
        setGamePhase('elimination-reveal')
      }
    } else {
      // Move to next voter
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    }
  }

  // PHASE 4D: ELIMINATION & REVEAL
  const handleMrXWordGuess = (guess: string) => {
    const civilianWord = players.find(p => p.role === 'civilian')?.word?.toLowerCase()
    const isCorrect = guess.toLowerCase() === civilianWord
    
    if (isCorrect) {
      // Mr. X wins immediately
      setGameStats(prev => ({ ...prev, mrXWins: prev.mrXWins + 1 }))
      setGamePhase('game-end')
    } else {
      // Continue to round end or game end
      proceedAfterElimination()
    }
    setCurrentInput("")
  }

  const proceedAfterElimination = () => {
    // Check win conditions
    const winner = checkWinCondition(players)
    
    if (winner) {
      setGameStats(prev => ({
        ...prev,
        civilianWins: winner === 'civilians' ? prev.civilianWins + 1 : prev.civilianWins,
        undercoverWins: winner === 'undercover' ? prev.undercoverWins + 1 : prev.undercoverWins,
        roundsPlayed: currentRound
      }))
      setGamePhase('game-end')
    } else if (currentRound >= config.rounds) {
      setGamePhase('game-end')
    } else {
      setGamePhase('round-end')
    }
  }

  // PHASE 6: ROUND END & NEW ROUND
  const startNextRound = () => {
    // Reset round state
    setCurrentRound(currentRound + 1)
    setVotes({})
    setEliminatedThisRound(null)
    
    // Reset player voting status
    const resetPlayers = players.map(p => ({ ...p, hasVoted: false }))
    setPlayers(resetPlayers)
    
    // Generate new speaking order
    const alivePlayers = resetPlayers.filter(p => !p.isEliminated)
    const newOrder = generateSpeakingOrder(alivePlayers)
    setSpeakingOrder(newOrder)
    
    setGamePhase('clue-phase')
    setCurrentPlayerIndex(0)
  }

  // PHASE 7: GAME END
  const resetGame = () => {
    setGamePhase('host-config')
    setPlayers([])
    setCurrentPlayerIndex(0)
    setCurrentRound(1)
    setSpeakingOrder([])
    setVotes({})
    setEliminatedThisRound(null)
    setGameStats({
      totalClues: 0,
      correctGuesses: 0,
      mrXWins: 0,
      civilianWins: 0,
      undercoverWins: 0,
      roundsPlayed: 0
    })
    setCurrentInput("")
    setSelectedVote("")
    setShowWord(false)
    setShowPrivacyScreen(false)
    setCurrentRevealPlayer(null)
  }

  // Helper functions
  const getCurrentSpeakingPlayer = () => {
    if (gamePhase !== 'clue-phase' || speakingOrder.length === 0) return null
    const playerId = speakingOrder[currentPlayerIndex]
    return players.find(p => p.id === playerId)
  }

  const getAlivePlayers = () => players.filter(p => !p.isEliminated)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(147, 51, 234, 0.3)" />
      <BackgroundBeams />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">
              {gamePhase === 'host-config' ? 'Game Setup' :
               gamePhase === 'player-onboarding' ? 'Add Players' :
               gamePhase === 'role-assignment' ? 'Role Assignment' :
               `Round ${currentRound}`}
            </h1>
            <p className="text-sm text-slate-300 capitalize">
              {gamePhase.replace('-', ' ')}
            </p>
          </div>
          <div className="text-right">
            {gamePhase !== 'host-config' && gamePhase !== 'player-onboarding' && (
              <>
                <div className="text-sm text-slate-300">Players</div>
                <div className="text-lg font-bold text-white">
                  {getAlivePlayers().length}/{players.length}
                </div>
              </>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PHASE 1: HOST CONFIGURATION */}
          {gamePhase === 'host-config' && (
            <motion.div
              key="host-config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={20} />
                <CardHeader className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Settings className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl text-white">Host Configuration</CardTitle>
                  <CardDescription className="text-slate-300">
                    Configure your perfect party game session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Player Count */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">
                      Number of Players: {config.playerCount}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={config.playerCount}
                      onChange={(e) => setConfig({ ...config, playerCount: parseInt(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>3 players</span>
                      <span>20 players</span>
                    </div>
                  </div>

                  {/* Role Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Undercover Players: {config.undercoverCount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max={Math.max(1, Math.floor(config.playerCount / 3))}
                        value={config.undercoverCount}
                        onChange={(e) => setConfig({ ...config, undercoverCount: parseInt(e.target.value) })}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Mr. X Players: {config.mrXCount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max={Math.max(1, Math.floor(config.playerCount / 4))}
                        value={config.mrXCount}
                        onChange={(e) => setConfig({ ...config, mrXCount: parseInt(e.target.value) })}
                        className="w-full accent-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">
                      Choose Word Pack from Supabase
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {wordPacks.map((pack) => (
                        <Card
                          key={pack.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            config.wordPackId === pack.id
                              ? 'ring-2 ring-purple-500 bg-purple-500/20'
                              : 'bg-white/5 hover:bg-white/10'
                          } border border-white/20`}
                          onClick={() => setConfig({ ...config, wordPackId: pack.id })}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm text-white">{pack.title}</CardTitle>
                              <Badge 
                                className={
                                  pack.difficulty === 'easy' ? 'bg-green-500' :
                                  pack.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                }
                              >
                                {pack.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-xs text-slate-300 mb-2">
                              {pack.description}
                            </CardDescription>
                            <div className="text-xs text-slate-400">
                              {pack.wordPairs.length} word pairs • {pack.type}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Rounds Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">
                      Number of Rounds
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 7].map(rounds => (
                        <Button
                          key={rounds}
                          variant={config.rounds === rounds ? "default" : "outline"}
                          onClick={() => setConfig({ ...config, rounds })}
                          className={config.rounds === rounds ? 
                            "bg-purple-500 hover:bg-purple-600" : 
                            "border-white/30 text-white hover:bg-white/10"
                          }
                        >
                          {rounds} Rounds
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Features */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Optional Features
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { key: 'spectatorVoting', label: 'Spectator Voting', icon: Vote, desc: 'Eliminated players can still vote' },
                        { key: 'minigamesEnabled', label: 'Minigames for Eliminated Civilians', icon: Gamepad2, desc: 'Fun activities for eliminated players' },
                        { key: 'observerMode', label: 'Observer Mode', icon: Eye, desc: 'Eliminated players can watch with limited info' },
                        { key: 'discussionTimer', label: 'Discussion Timer', icon: Timer, desc: 'Timed discussion phase' },
                        { key: 'animatedScoreboard', label: 'Animated Scoreboard', icon: Trophy, desc: 'Enhanced score displays' }
                      ].map(({ key, label, icon: Icon, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-slate-300 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-white">{label}</div>
                              <div className="text-xs text-slate-400">{desc}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setConfig({ ...config, [key]: !config[key as keyof GameConfig] })}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              config[key as keyof GameConfig] ? 'bg-purple-500' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              config[key as keyof GameConfig] ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Discussion Timer Duration */}
                    {config.discussionTimer && (
                      <div className="space-y-2 ml-8">
                        <label className="block text-sm font-medium text-white">
                          Discussion Time: {config.discussionTimeMinutes} minutes
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={config.discussionTimeMinutes}
                          onChange={(e) => setConfig({ ...config, discussionTimeMinutes: parseInt(e.target.value) })}
                          className="w-full accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>1 min</span>
                          <span>5 min</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monetization Preview */}
                  <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-200">Cosmetic/Unlock Shop</span>
                      <Badge className="bg-orange-500 text-white">Coming Soon</Badge>
                    </div>
                    <p className="text-xs text-yellow-100">
                      Premium word packs, custom avatars, exclusive badges, and cosmetic unlocks will be available soon!
                    </p>
                  </div>

                  <Button 
                    onClick={startPlayerOnboarding} 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving Configuration...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-5 h-5" />
                        Save & Proceed to Player Setup
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 2: PLAYER ONBOARDING */}
          {gamePhase === 'player-onboarding' && (
            <motion.div
              key="player-onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader className="text-center">
                  <UserPlus className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Player Onboarding</CardTitle>
                  <CardDescription className="text-slate-300">
                    Add players sequentially ({players.length}/{config.playerCount})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(players.length / config.playerCount) * 100}%` }}
                    />
                  </div>

                  {/* Current Players */}
                  {players.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Players Added:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {players.map((player, index) => (
                          <div key={player.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-2xl">{player.avatar}</span>
                            <div>
                              <div className="text-sm font-medium text-white">{player.name}</div>
                              <div className="text-xs text-slate-400">Player {index + 1}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Next Player */}
                  {players.length < config.playerCount && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-lg font-medium text-white flex items-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Enter Player {players.length + 1} Name
                        </label>
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder={`Player ${players.length + 1}`}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                          autoFocus
                        />
                      </div>
                      <Button 
                        onClick={addPlayer} 
                        className="w-full bg-green-500 hover:bg-green-600"
                        disabled={!currentInput.trim()}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Player {players.length + 1}
                      </Button>
                    </div>
                  )}

                  {/* Host Review & Start Game */}
                  {players.length === config.playerCount && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-semibold text-green-200">All Players Added!</span>
                        </div>
                        <p className="text-xs text-green-100">
                          Host, please review the full player list before starting the game.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={startRoleAssignment} 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Assigning Roles & Words...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            Host Taps "Start Game"
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 3: ROLE & WORD ASSIGNMENT (Private Reveal) */}
          {gamePhase === 'role-assignment' && (
            <motion.div
              key="role-assignment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {showPrivacyScreen && currentRevealPlayer && (
                <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                  <Meteors number={10} />
                  <CardHeader>
                    <div className="text-6xl mb-4">🔒</div>
                    <CardTitle className="text-xl text-white">Private Reveal</CardTitle>
                    <CardDescription className="text-slate-300">
                      Hand device to {currentRevealPlayer.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white font-medium mb-2">
                        Are you {currentRevealPlayer.name}?
                      </p>
                      <p className="text-sm text-slate-300">
                        Only {currentRevealPlayer.name} should see their role and word. 
                        Make sure others are looking away!
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setShowPrivacyScreen(false)
                        setShowWord(true)
                      }} 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Yes, I am {currentRevealPlayer.name}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Role & Word Reveal Modal */}
              <AnimatePresence>
                {showWord && currentRevealPlayer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                  >
                    <Card className="max-w-md mx-4 bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                      <Meteors number={20} />
                      <CardHeader className="text-center">
                        <div className="text-4xl mb-4">{currentRevealPlayer.avatar}</div>
                        <CardTitle className="text-xl text-white">{currentRevealPlayer.name}</CardTitle>
                        <Badge 
                          className={
                            currentRevealPlayer.role === 'civilian' ? 'bg-blue-500' :
                            currentRevealPlayer.role === 'undercover' ? 'bg-red-500' : 'bg-yellow-500'
                          }
                        >
                          {currentRevealPlayer.role === 'civilian' ? 'Civilian' :
                           currentRevealPlayer.role === 'undercover' ? 'Undercover' : 'Mr. X'}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {currentRevealPlayer.role !== 'mrx' && (
                          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-sm text-slate-300 mb-2">Your word is:</div>
                            <div className="text-3xl font-bold text-white">{currentRevealPlayer.word}</div>
                          </div>
                        )}
                        
                        {/* Only show role to Mr. X players */}
                        {currentRevealPlayer.role === 'civilian' && (
                          <div className="text-center p-6 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <div className="text-sm text-blue-200 mb-2">Your role:</div>
                            <div className="text-lg text-blue-100 mb-3">
                              You are part of the majority group
                            </div>
                            <div className="text-sm text-blue-200">
                              Give helpful clues about your word to help others identify the outsiders!
                            </div>
                          </div>
                        )}
                        
                        {currentRevealPlayer.role === 'undercover' && (
                          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-sm text-slate-300 mb-2">Your role:</div>
                            <div className="text-lg text-white mb-3">
                              You have a different word than most players
                            </div>
                            <div className="text-sm text-slate-300">
                              Try to blend in and avoid being discovered!
                            </div>
                          </div>
                        )}
                        
                        {currentRevealPlayer.role === 'mrx' && (
                          <div className="text-center p-6 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                            <div className="text-sm text-yellow-200 mb-2">You are Mr. X!</div>
                            <div className="text-lg text-yellow-100">
                              Listen carefully and guess the civilian word to win instantly!
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          onClick={proceedToNextReveal}
                          className="w-full bg-green-500 hover:bg-green-600"
                        >
                          {currentPlayerIndex < players.length - 1 ? 'Next Player' : 'Start Game'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PHASE 4A: CLUE PHASE */}
          {gamePhase === 'clue-phase' && (
            <motion.div
              key="clue-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader className="text-center">
                  <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Clue Phase</CardTitle>
                  <CardDescription className="text-slate-300">
                    Players give one-word clues about their secret word
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Host Counter Display */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-sm text-slate-400 mb-1">HOST INFO</div>
                      <div className="text-lg font-bold text-blue-400">{players.filter(p => p.role === 'civilian').length}</div>
                      <div className="text-xs text-slate-300">Civilians</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{undercoverCount}</div>
                      <div className="text-xs text-slate-300">Undercover Found</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{mrXCount}</div>
                      <div className="text-xs text-slate-300">Mr. X Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{getAlivePlayers().length}</div>
                      <div className="text-xs text-slate-300">Players Alive</div>
                    </div>
                  </div>

                  {/* Current Speaker */}
                  {getCurrentSpeakingPlayer() && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">{getCurrentSpeakingPlayer()?.avatar}</span>
                        <div>
                          <div className="text-xl font-bold text-white">
                            {getCurrentSpeakingPlayer()?.name}'s Turn
                          </div>
                          <div className="text-sm text-slate-300">
                            Player {currentPlayerIndex + 1} of {speakingOrder.length}
                          </div>
                        </div>
                      </div>

                      {/* Clue Input */}
                      <div className="space-y-3">
                        <label className="text-lg font-medium text-white">
                          Give a one-word clue:
                        </label>
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder="Enter your clue..."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl"
                          onKeyPress={(e) => e.key === 'Enter' && submitClue()}
                          autoFocus
                        />
                      </div>

                      <Button 
                        onClick={submitClue}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        disabled={!currentInput.trim()}
                      >
                        Submit Clue
                      </Button>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentPlayerIndex + 1) / speakingOrder.length) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 4B: DISCUSSION PHASE */}
          {gamePhase === 'discussion-phase' && (
            <motion.div
              key="discussion-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={10} />
                <CardHeader className="text-center">
                  <Timer className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Discussion Phase</CardTitle>
                  <CardDescription className="text-slate-300">
                    Discuss the clues and decide who to vote out
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-orange-400 mb-2">
                      {Math.floor(discussionTimeLeft / 60)}:{(discussionTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-slate-300">Time remaining</div>
                  </div>

                  {/* Host Counter Display */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-sm text-slate-400 mb-1">HOST INFO</div>
                      <div className="text-lg font-bold text-blue-400">{players.filter(p => p.role === 'civilian').length}</div>
                      <div className="text-xs text-slate-300">Civilians</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{undercoverCount}</div>
                      <div className="text-xs text-slate-300">Undercover Found</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{mrXCount}</div>
                      <div className="text-xs text-slate-300">Mr. X Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{getAlivePlayers().length}</div>
                      <div className="text-xs text-slate-300">Players Alive</div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <p className="text-orange-100">
                      Discuss the clues given by each player. Who seems suspicious?
                    </p>
                  </div>

                  <Button 
                    onClick={() => {
                      setGamePhase('voting-phase')
                      setCurrentPlayerIndex(0)
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Skip to Voting
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 4C: VOTING PHASE */}
          {gamePhase === 'voting-phase' && (
            <motion.div
              key="voting-phase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader className="text-center">
                  <Vote className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Voting Phase</CardTitle>
                  <CardDescription className="text-slate-300">
                    Each player votes to eliminate someone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Host Counter Display */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-sm text-slate-400 mb-1">HOST INFO</div>
                      <div className="text-lg font-bold text-blue-400">{players.filter(p => p.role === 'civilian').length}</div>
                      <div className="text-xs text-slate-300">Civilians</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{undercoverCount}</div>
                      <div className="text-xs text-slate-300">Undercover Found</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{mrXCount}</div>
                      <div className="text-xs text-slate-300">Mr. X Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{getAlivePlayers().length}</div>
                      <div className="text-xs text-slate-300">Players Alive</div>
                    </div>
                  </div>

                  {/* Current Voter */}
                  {getAlivePlayers()[currentPlayerIndex] && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">{getAlivePlayers()[currentPlayerIndex]?.avatar}</span>
                        <div>
                          <div className="text-xl font-bold text-white">
                            {getAlivePlayers()[currentPlayerIndex]?.name}'s Vote
                          </div>
                          <div className="text-sm text-slate-300">
                            Voter {currentPlayerIndex + 1} of {getAlivePlayers().length}
                          </div>
                        </div>
                      </div>

                      {/* Vote Options */}
                      <div className="space-y-3">
                        <label className="text-lg font-medium text-white">
                          Who do you want to eliminate?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {getAlivePlayers()
                            .filter(p => p.id !== getAlivePlayers()[currentPlayerIndex]?.id)
                            .map(player => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedVote(player.id)}
                              className={`p-3 rounded-lg border transition-all ${
                                selectedVote === player.id
                                  ? 'bg-red-500/30 border-red-500'
                                  : 'bg-white/5 border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className="text-2xl mb-1">{player.avatar}</div>
                              <div className="text-sm text-white">{player.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={submitVote}
                        className="w-full bg-red-500 hover:bg-red-600"
                        disabled={!selectedVote}
                      >
                        Submit Vote
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 4D: ELIMINATION REVEAL */}
          {gamePhase === 'elimination-reveal' && eliminatedThisRound && (
            <motion.div
              key="elimination-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={20} />
                <CardHeader className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Player Eliminated</CardTitle>
                  <CardDescription className="text-slate-300">
                    The votes have been counted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Eliminated Player */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-6xl opacity-50">{eliminatedThisRound.avatar}</span>
                      <div>
                        <div className="text-2xl font-bold text-red-400">
                          {eliminatedThisRound.name}
                        </div>
                        <div className="text-sm text-slate-300">has been eliminated</div>
                      </div>
                    </div>

                    {/* Role Reveal */}
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-slate-300 mb-2">
                        {eliminatedThisRound.name} was:
                      </div>
                      <Badge 
                        className={
                          eliminatedThisRound.role === 'civilian' ? 'bg-blue-500 text-white text-lg px-4 py-2' :
                          eliminatedThisRound.role === 'undercover' ? 'bg-red-500 text-white text-lg px-4 py-2' : 
                          'bg-yellow-500 text-black text-lg px-4 py-2'
                        }
                      >
                        {eliminatedThisRound.role === 'civilian' ? 'Civilian' :
                         eliminatedThisRound.role === 'undercover' ? 'Undercover' : 'Mr. X'}
                      </Badge>
                      {eliminatedThisRound.word && (
                        <div className="mt-3">
                          <div className="text-sm text-slate-400">Their word was:</div>
                          <div className="text-xl font-bold text-white">{eliminatedThisRound.word}</div>
                        </div>
                      )}
                    </div>

                    {/* Mr. X Word Guess (if Mr. X is still alive) */}
                    {getAlivePlayers().some(p => p.role === 'mrx') && eliminatedThisRound.role !== 'mrx' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                          <div className="text-yellow-200 font-semibold mb-2">Mr. X Final Guess</div>
                          <div className="text-sm text-yellow-100">
                            Any surviving Mr. X can now guess the civilian word to win instantly!
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-lg font-medium text-white">
                            Mr. X, what is the civilian word?
                          </label>
                          <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder="Enter your guess..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-xl"
                            onKeyPress={(e) => e.key === 'Enter' && handleMrXWordGuess(currentInput)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleMrXWordGuess(currentInput)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                            disabled={!currentInput.trim()}
                          >
                            Submit Guess
                          </Button>
                          <Button 
                            onClick={proceedAfterElimination}
                            variant="outline"
                            className="flex-1 border-white/30 text-white hover:bg-white/10"
                          >
                            Skip Guess
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Continue Button (if no Mr. X alive or Mr. X was eliminated) */}
                    {(!getAlivePlayers().some(p => p.role === 'mrx') || eliminatedThisRound.role === 'mrx') && (
                      <Button 
                        onClick={proceedAfterElimination}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Continue Game
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 5: ROUND END */}
          {gamePhase === 'round-end' && (
            <motion.div
              key="round-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader className="text-center">
                  <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Round {currentRound} Complete</CardTitle>
                  <CardDescription className="text-slate-300">
                    Preparing for the next round
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-lg text-white mb-2">Round Summary</div>
                      <div className="text-sm text-slate-300">
                        {eliminatedThisRound ? `${eliminatedThisRound.name} was eliminated` : 'No one was eliminated'}
                      </div>
                      <div className="text-sm text-slate-300">
                        {getAlivePlayers().length} players remaining
                      </div>
                    </div>

                    <Button 
                      onClick={startNextRound}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Start Round {currentRound + 1}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* PHASE 6: GAME END */}
          {gamePhase === 'game-end' && (
            <motion.div
              key="game-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={25} />
                <CardHeader className="text-center">
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <CardTitle className="text-3xl text-white">Game Over!</CardTitle>
                  <CardDescription className="text-slate-300">
                    {checkWinCondition(players) === 'civilians' ? 'Civilians Win!' :
                     checkWinCondition(players) === 'undercover' ? 'Undercover Wins!' :
                     checkWinCondition(players) === 'mrx' ? 'Mr. X Wins!' : 'Game Complete!'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    {/* Game Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-blue-400">{gameStats.totalClues}</div>
                        <div className="text-sm text-slate-300">Total Clues</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-green-400">{currentRound}</div>
                        <div className="text-sm text-slate-300">Rounds Played</div>
                      </div>
                    </div>

                    {/* Final Player Status */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Final Results:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {players.map(player => (
                          <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                            player.isEliminated ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{player.avatar}</span>
                              <div>
                                <div className="text-sm font-medium text-white">{player.name}</div>
                                <div className="text-xs text-slate-400">
                                  {player.role === 'civilian' ? 'Civilian' :
                                   player.role === 'undercover' ? 'Undercover' : 'Mr. X'}
                                  {player.word && ` - "${player.word}"`}
                                </div>
                              </div>
                            </div>
                            <Badge className={player.isEliminated ? 'bg-red-500' : 'bg-green-500'}>
                              {player.isEliminated ? 'Eliminated' : 'Survived'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={resetGame}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-white/30 text-white hover:bg-white/10"
                      >
                        <Link to="/" className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Home
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    
  )
}