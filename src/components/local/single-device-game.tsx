import { useState, useEffect } from "react"
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
  Shuffle
} from "lucide-react"
import {
  LocalGameConfig,
  LocalGameState,
  createLocalGame,
  getWordPacks,
  saveGameConfig,
  saveGameState,
  getRandomAvatar
export function SingleDeviceGame() {
  const [gameState, setGameState] = useState<LocalGameState | null>(null)
  const [wordPacks, setWordPacks] = useState<WordPack[]>([])
  const [loading, setLoading] = useState(false)
  const [showWord, setShowWord] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(0)
  const [selectedVote, setSelectedVote] = useState<string>("")

  // Game configuration state
  const [config, setConfig] = useState<Partial<LocalGameConfig>>({
    playerCount: 6,
    undercoverCount: 1,
    mrXCount: 1,
    wordPackId: 'general',
    rounds: 3,
    spectatorVoting: false,
    minigamesEnabled: true,
    observerMode: true,
    discussionTimer: true,
    animatedScoreboard: true
  })

  // Load word packs on component mount
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

  // Discussion timer effect
  useEffect(() => {
    if (discussionTimeLeft > 0) {
      const timer = setTimeout(() => {
        setDiscussionTimeLeft(discussionTimeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [discussionTimeLeft])

  const startGame = async () => {
    setLoading(true)
    try {
      const gameConfig: LocalGameConfig = {
        id: crypto.randomUUID(),
        playerCount: config.playerCount!,
        undercoverCount: config.undercoverCount!,
        mrXCount: config.mrXCount!,
        wordPackId: config.wordPackId!,
        rounds: config.rounds!,
        spectatorVoting: config.spectatorVoting!,
        minigamesEnabled: config.minigamesEnabled!,
        observerMode: config.observerMode!,
        discussionTimer: config.discussionTimer!,
        animatedScoreboard: config.animatedScoreboard!,
        createdAt: new Date().toISOString()
      }

      // Save config to Supabase
      await saveGameConfig(gameConfig)

      const newGameState = createLocalGame(gameConfig)
      newGameState.currentPhase = 'onboarding'
      
      setGameState(newGameState)
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = () => {
    if (!gameState || gameState.players.length >= gameState.config.playerCount) return

    const newPlayer: LocalPlayer = {
      id: crypto.randomUUID(),
      name: currentInput.trim() || `Player ${gameState.players.length + 1}`,
      avatar: getRandomAvatar(),
      role: 'civilian',
      isEliminated: false,
      score: 0,
      cluesGiven: [],
      votesReceived: 0,
      badges: []
    }

    const updatedGameState = {
      ...gameState,
      players: [...gameState.players, newPlayer],
      updatedAt: new Date().toISOString()
    }

    setGameState(updatedGameState)
    setCurrentInput("")
    
    // Save to Supabase
    saveGameState(updatedGameState).catch(console.error)
  }

  const startRoleAssignment = async () => {
    if (!gameState) return

    setLoading(true)
    try {
      const playersWithRoles = await assignRolesAndWords(gameState.players, gameState.config)
      const speakingOrder = generateSpeakingOrder(playersWithRoles)

      const updatedGameState = {
        ...gameState,
        players: playersWithRoles,
        speakingOrder,
        currentPhase: 'role-reveal' as const,
        currentPlayerIndex: 0,
        updatedAt: new Date().toISOString()
      }

      setGameState(updatedGameState)
      await saveGameState(updatedGameState)
    } catch (error) {
      console.error('Failed to assign roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const proceedToNextPhase = () => {
    if (!gameState) return

    let nextPhase = gameState.currentPhase
    let nextPlayerIndex = gameState.currentPlayerIndex

    switch (gameState.currentPhase) {
      case 'role-reveal':
        if (gameState.currentPlayerIndex < gameState.players.length - 1) {
          nextPlayerIndex = gameState.currentPlayerIndex + 1
        } else {
          nextPhase = 'clue-giving'
          nextPlayerIndex = 0
        }
        break
      case 'clue-giving':
        if (gameState.currentPlayerIndex < gameState.speakingOrder.length - 1) {
          nextPlayerIndex = gameState.currentPlayerIndex + 1
        } else {
          nextPhase = gameState.config.discussionTimer ? 'discussion' : 'voting'
          nextPlayerIndex = 0
          if (gameState.config.discussionTimer) {
            setDiscussionTimeLeft(120) // 2 minutes
          }
        }
        break
      case 'discussion':
        nextPhase = 'voting'
        nextPlayerIndex = 0
        break
      case 'voting':
        if (gameState.currentPlayerIndex < gameState.players.filter(p => !p.isEliminated).length - 1) {
          nextPlayerIndex = gameState.currentPlayerIndex + 1
        } else {
          nextPhase = 'elimination'
          nextPlayerIndex = 0
        }
        break
      case 'elimination':
        const winner = checkWinCondition(gameState.players)
        if (winner || gameState.currentRound >= gameState.config.rounds) {
          nextPhase = 'game-end'
        } else {
          nextPhase = 'round-end'
        }
        break
      case 'round-end':
        nextPhase = 'clue-giving'
        nextPlayerIndex = 0
        break
    }

    const updatedGameState = {
      ...gameState,
      currentPhase: nextPhase,
      currentPlayerIndex: nextPlayerIndex,
      updatedAt: new Date().toISOString()
    }

    setGameState(updatedGameState)
    saveGameState(updatedGameState).catch(console.error)
  }

  const submitVote = () => {
    if (!gameState || !selectedVote) return

    const currentPlayer = gameState.players.filter(p => !p.isEliminated)[gameState.currentPlayerIndex]
    const updatedVotes = {
      ...gameState.votes,
      [currentPlayer.id]: selectedVote
    }

    const updatedGameState = {
      ...gameState,
      votes: updatedVotes,
      updatedAt: new Date().toISOString()
    }

    setGameState(updatedGameState)
    setSelectedVote("")
    
    // Check if all players have voted
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    if (Object.keys(updatedVotes).length >= alivePlayers.length) {
      // Process elimination
      const eliminatedPlayer = calculateElimination(updatedVotes, gameState.players)
      if (eliminatedPlayer) {
        const updatedPlayers = gameState.players.map(p => 
          p.id === eliminatedPlayer.id ? { ...p, isEliminated: true } : p
        )
        
        const finalGameState = {
          ...updatedGameState,
          players: updatedPlayers,
          eliminatedPlayers: [...gameState.eliminatedPlayers, eliminatedPlayer],
          currentPhase: 'elimination' as const
        }
        
        setGameState(finalGameState)
        saveGameState(finalGameState).catch(console.error)
      }
    } else {
      proceedToNextPhase()
    }
  }

  const resetGame = () => {
    setGameState(null)
    setCurrentInput("")
    setSelectedVote("")
    setShowWord(false)
    setDiscussionTimeLeft(0)
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(147, 51, 234, 0.3)" />
        <BackgroundBeams />
        
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/local" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              Single Device (Pass & Play)
            </motion.h1>
            <div className="w-20" />
          </div>

          {/* Game Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
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
                <CardTitle className="text-2xl text-white">Game Configuration</CardTitle>
                <CardDescription className="text-slate-300">
                  Set up your perfect party game experience
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
                    <span>3</span>
                    <span>20</span>
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
                      max={Math.floor((config.playerCount || 6) / 3)}
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
                      max={Math.floor((config.playerCount || 6) / 4)}
                      value={config.mrXCount}
                      onChange={(e) => setConfig({ ...config, mrXCount: parseInt(e.target.value) })}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>

                {/* Word Pack Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Choose Word Pack
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
                              variant={pack.difficulty === 'easy' ? 'default' : 'secondary'}
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
                            {pack.wordPairs.length} word pairs
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Rounds */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Number of Rounds: {config.rounds}
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
                        {rounds}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'spectatorVoting', label: 'Spectator Voting', icon: Vote },
                      { key: 'minigamesEnabled', label: 'Minigames for Eliminated', icon: Gamepad2 },
                      { key: 'observerMode', label: 'Observer Mode', icon: Eye },
                      { key: 'discussionTimer', label: 'Discussion Timer', icon: Timer },
                      { key: 'animatedScoreboard', label: 'Animated Scoreboard', icon: Trophy }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-300" />
                          <span className="text-sm text-white">{label}</span>
                        </div>
                        <button
                          onClick={() => setConfig({ ...config, [key]: !config[key as keyof typeof config] })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            config[key as keyof typeof config] ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            config[key as keyof typeof config] ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monetization Preview */}
                <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-200">Premium Features</span>
                    <Badge className="bg-orange-500 text-white">Coming Soon</Badge>
                  </div>
                  <p className="text-xs text-yellow-100">
                    Unlock premium word packs, custom avatars, and exclusive game modes!
                  </p>
                </div>

                <Button 
                  onClick={startGame} 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting Up Game...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Start Game
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const alivePlayers = gameState.players.filter(p => !p.isEliminated)
  const speakingPlayer = gameState.speakingOrder[gameState.currentPlayerIndex] ? 
    gameState.players.find(p => p.id === gameState.speakingOrder[gameState.currentPlayerIndex]) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(147, 51, 234, 0.3)" />
      <BackgroundBeams />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={resetGame}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Game
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Round {gameState.currentRound}</h1>
            <p className="text-sm text-slate-300 capitalize">{gameState.currentPhase.replace('-', ' ')}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-300">Players</div>
            <div className="text-lg font-bold text-white">{alivePlayers.length}/{gameState.players.length}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Player Onboarding */}
          {gameState.currentPhase === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader className="text-center">
                  <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Player Onboarding</CardTitle>
                  <CardDescription className="text-slate-300">
                    Add players to the game ({gameState.players.length}/{gameState.config.playerCount})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Players */}
                  {gameState.players.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Players Added:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {gameState.players.map((player, index) => (
                          <div key={player.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
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

                  {/* Add Player */}
                  {gameState.players.length < gameState.config.playerCount && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Player {gameState.players.length + 1} Name
                        </label>
                        <input
                          type="text"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder={`Player ${gameState.players.length + 1}`}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                        />
                      </div>
                      <Button onClick={addPlayer} className="w-full bg-purple-500 hover:bg-purple-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Player
                      </Button>
                    </div>
                  )}

                  {/* Start Game */}
                  {gameState.players.length === gameState.config.playerCount && (
                    <Button 
                      onClick={startRoleAssignment} 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Assigning Roles...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shuffle className="w-5 h-5" />
                          Start Game
                        </div>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Role Reveal */}
          {gameState.currentPhase === 'role-reveal' && currentPlayer && (
            <motion.div
              key="role-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={10} />
                <CardHeader>
                  <div className="text-6xl mb-4">🔒</div>
                  <CardTitle className="text-xl text-white">Private Reveal</CardTitle>
                  <CardDescription className="text-slate-300">
                    Hand device to {currentPlayer.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white font-medium mb-2">Are you {currentPlayer.name}?</p>
                    <p className="text-sm text-slate-300">
                      Only {currentPlayer.name} should see their role and word
                    </p>
                  </div>
                  
                  <Button onClick={() => setShowWord(true)} className="w-full bg-blue-500 hover:bg-blue-600">
                    Yes, I'm {currentPlayer.name}
                  </Button>
                </CardContent>
              </Card>

              {/* Role & Word Modal */}
              <AnimatePresence>
                {showWord && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowWord(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-sm mx-4 border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {currentPlayer.role === 'mrx' ? '👤' : 
                           currentPlayer.role === 'undercover' ? '🎭' : '🛡️'}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {currentPlayer.role === 'mrx' ? 'Mr. X' :
                           currentPlayer.role === 'undercover' ? 'Undercover' : 'Civilian'}
                        </h3>
                        
                        {currentPlayer.role === 'mrx' ? (
                          <div className="space-y-4">
                            <p className="text-yellow-200 font-medium">
                              You have NO word!
                            </p>
                            <p className="text-sm text-slate-300">
                              Your mission is to bluff and deduce the group's secret word.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className={`text-3xl font-bold p-4 rounded-lg ${
                              currentPlayer.role === 'civilian' 
                                ? 'bg-blue-500/20 text-blue-200' 
                                : 'bg-red-500/20 text-red-200'
                            }`}>
                              {currentPlayer.word}
                            </div>
                            <p className="text-sm text-slate-300">
                              {currentPlayer.role === 'civilian' 
                                ? 'Give clues to help other civilians identify the undercover and Mr. X.'
                                : 'Try to blend in without revealing you have a different word!'
                              }
                            </p>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => {
                            setShowWord(false)
                            setTimeout(proceedToNextPhase, 500)
                          }} 
                          className="w-full mt-6 bg-purple-500 hover:bg-purple-600"
                        >
                          I've Memorized My Role
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Clue Giving */}
          {gameState.currentPhase === 'clue-giving' && speakingPlayer && (
            <motion.div
              key="clue-giving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={12} />
                <CardHeader className="text-center">
                  <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">
                    {speakingPlayer.name}'s Turn
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Give a one-word clue about your secret word
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Speaking Order */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Speaking Order:</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.speakingOrder.map((playerId, index) => {
                        const player = gameState.players.find(p => p.id === playerId)
                        if (!player) return null
                        return (
                          <Badge 
                            key={playerId}
                            className={`${
                              index === gameState.currentPlayerIndex 
                                ? 'bg-green-500' 
                                : index < gameState.currentPlayerIndex 
                                ? 'bg-gray-500' 
                                : 'bg-blue-500'
                            } text-white`}
                          >
                            {index + 1}. {player.name} {player.avatar}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  {/* Word Reminder */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowWord(true)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Show My Word/Role
                    </Button>
                  </div>

                  {/* Clue Input */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Enter your one-word clue..."
                      className="w-full px-4 py-3 text-center text-xl bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength={20}
                    />
                    <Button 
                      onClick={() => {
                        // Save clue and proceed
                        const updatedPlayers = gameState.players.map(p => 
                          p.id === speakingPlayer.id 
                            ? { ...p, cluesGiven: [...p.cluesGiven, currentInput.trim()] }
                            : p
                        )
                        setGameState({
                          ...gameState,
                          players: updatedPlayers,
                          gameStats: {
                            ...gameState.gameStats,
                            totalClues: gameState.gameStats.totalClues + 1
                          }
                        })
                        setCurrentInput("")
                        proceedToNextPhase()
                      }}
                      className="w-full bg-green-500 hover:bg-green-600" 
                      disabled={!currentInput.trim()}
                    >
                      Submit Clue & Continue
                    </Button>
                  </div>

                  {/* Previous Clues */}
                  {gameState.players.some(p => p.cluesGiven.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Clues Given:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {gameState.players
                          .filter(p => p.cluesGiven.length > 0 && !p.isEliminated)
                          .map(player => (
                            <div key={player.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                              <span className="text-white">{player.name} {player.avatar}:</span>
                              <span className="font-medium text-green-300">
                                {player.cluesGiven[player.cluesGiven.length - 1]}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Word/Role Reminder Modal */}
              <AnimatePresence>
                {showWord && speakingPlayer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowWord(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-sm mx-4 border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {speakingPlayer.role === 'mrx' ? '👤' : 
                           speakingPlayer.role === 'undercover' ? '🎭' : '🛡️'}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">
                          {speakingPlayer.role === 'mrx' ? 'Mr. X - No Word!' :
                           speakingPlayer.role === 'undercover' ? 'Undercover' : 'Civilian'}
                        </h3>
                        
                        {speakingPlayer.role !== 'mrx' && (
                          <div className={`text-3xl font-bold p-4 rounded-lg mb-4 ${
                            speakingPlayer.role === 'civilian' 
                              ? 'bg-blue-500/20 text-blue-200' 
                              : 'bg-red-500/20 text-red-200'
                          }`}>
                            {speakingPlayer.word}
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-300 mb-6">
                          Tap anywhere to close
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Discussion Phase */}
          {gameState.currentPhase === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={8} />
                <CardHeader>
                  <Timer className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Discussion Time</CardTitle>
                  <CardDescription className="text-slate-300">
                    Discuss the clues and decide who to eliminate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-orange-400 mb-2">
                      {Math.floor(discussionTimeLeft / 60)}:{(discussionTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-slate-300">Time remaining</p>
                  </div>

                  {/* All Clues Summary */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">All Clues:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alivePlayers.map(player => (
                        <div key={player.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{player.name} {player.avatar}</span>
                            <span className="text-lg text-green-300">
                              {player.cluesGiven[player.cluesGiven.length - 1] || 'No clue yet'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={proceedToNextPhase}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={discussionTimeLeft > 0}
                  >
                    {discussionTimeLeft > 0 ? 'Discussion in Progress...' : 'Proceed to Voting'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Voting Phase */}
          {gameState.currentPhase === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={10} />
                <CardHeader className="text-center">
                  <Vote className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Voting Time</CardTitle>
                  <CardDescription className="text-slate-300">
                    Hand device to {alivePlayers[gameState.currentPlayerIndex]?.name} to vote
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white font-medium">
                      {alivePlayers[gameState.currentPlayerIndex]?.name}, vote for who you think is Mr. X
                    </p>
                  </div>

                  {/* Vote Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alivePlayers
                      .filter(p => p.id !== alivePlayers[gameState.currentPlayerIndex]?.id)
                      .map(player => (
                        <Button
                          key={player.id}
                          variant={selectedVote === player.id ? "default" : "outline"}
                          onClick={() => setSelectedVote(player.id)}
                          className={`p-4 h-auto ${
                            selectedVote === player.id 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'border-white/30 text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{player.avatar}</div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm opacity-75">
                              "{player.cluesGiven[player.cluesGiven.length - 1] || 'No clue'}"
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>

                  <Button 
                    onClick={submitVote}
                    className="w-full bg-red-500 hover:bg-red-600" 
                    disabled={!selectedVote}
                  >
                    Cast Vote
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Elimination Phase */}
          {gameState.currentPhase === 'elimination' && gameState.eliminatedPlayers.length > 0 && (
            <motion.div
              key="elimination"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={15} />
                <CardHeader>
                  <div className="text-8xl mb-4">
                    {gameState.eliminatedPlayers[gameState.eliminatedPlayers.length - 1]?.role === 'mrx' ? '🎉' : '😔'}
                  </div>
                  <CardTitle className="text-2xl text-white">Player Eliminated</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const eliminatedPlayer = gameState.eliminatedPlayers[gameState.eliminatedPlayers.length - 1]
                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {eliminatedPlayer.name} {eliminatedPlayer.avatar} was eliminated!
                          </h3>
                          <Badge className={
                            eliminatedPlayer.role === 'civilian' ? 'bg-blue-500' :
                            eliminatedPlayer.role === 'undercover' ? 'bg-red-500' : 'bg-yellow-500'
                          }>
                            {eliminatedPlayer.role === 'civilian' ? 'Civilian' :
                             eliminatedPlayer.role === 'undercover' ? 'Undercover' : 'Mr. X'}
                          </Badge>
                          {eliminatedPlayer.word && (
                            <p className="text-sm text-slate-300 mt-2">
                              Their word was: <strong className="text-white">{eliminatedPlayer.word}</strong>
                            </p>
                          )}
                        </div>

                        {/* Mr. X Word Guess */}
                        {eliminatedPlayer.role === 'mrx' && (
                          <div className="space-y-4">
                            <p className="text-yellow-200 font-medium">
                              Mr. X gets one chance to guess the secret word to win!
                            </p>
                            <input
                              type="text"
                              value={currentInput}
                              onChange={(e) => setCurrentInput(e.target.value)}
                              placeholder="Enter your guess for the civilian word..."
                              className="w-full px-4 py-3 text-center text-xl bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <div className="flex gap-3">
                              <Button 
                                onClick={() => {
                                  // Check if guess is correct
                                  const civilianWord = gameState.players.find(p => p.role === 'civilian')?.word
                                  const isCorrect = currentInput.trim().toLowerCase() === civilianWord?.toLowerCase()
                                  
                                  if (isCorrect) {
                                    // Mr. X wins!
                                    setGameState({
                                      ...gameState,
                                      currentPhase: 'game-end',
                                      gameStats: {
                                        ...gameState.gameStats,
                                        mrXWins: gameState.gameStats.mrXWins + 1
                                      }
                                    })
                                  } else {
                                    // Continue game
                                    proceedToNextPhase()
                                  }
                                  setCurrentInput("")
                                }}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                                disabled={!currentInput.trim()}
                              >
                                Submit Guess
                              </Button>
                              <Button 
                                onClick={() => {
                                  setCurrentInput("")
                                  proceedToNextPhase()
                                }}
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/10"
                              >
                                Skip Guess
                              </Button>
                            </div>
                          </div>
                        )}

                        {eliminatedPlayer.role !== 'mrx' && (
                          <Button 
                            onClick={proceedToNextPhase}
                            className="w-full bg-purple-500 hover:bg-purple-600"
                          >
                            Continue Game
                          </Button>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game End */}
          {gameState.currentPhase === 'game-end' && (
            <motion.div
              key="game-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <Meteors number={20} />
                <CardHeader>
                  <div className="text-8xl mb-4">🏆</div>
                  <CardTitle className="text-3xl text-white">Game Over!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const winner = checkWinCondition(gameState.players)
                    return (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-4">
                            {winner === 'mrx' ? 'Mr. X Wins!' :
                             winner === 'civilians' ? 'Civilians Win!' :
                             winner === 'undercover' ? 'Undercover Wins!' : 'Game Complete!'}
                          </h2>
                          <p className="text-slate-300">
                            {winner === 'mrx' ? 'Mr. X successfully deceived everyone or guessed the word!' :
                             winner === 'civilians' ? 'The civilians successfully identified all threats!' :
                             winner === 'undercover' ? 'The undercover players survived and won!' :
                             'Thanks for playing!'}
                          </p>
                        </div>

                        {/* Final Scoreboard */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-white">Final Results</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {gameState.players.map(player => (
                              <div key={player.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{player.avatar}</span>
                                    <div>
                                      <div className="font-medium text-white">{player.name}</div>
                                      <Badge className={
                                        player.role === 'civilian' ? 'bg-blue-500' :
                                        player.role === 'undercover' ? 'bg-red-500' : 'bg-yellow-500'
                                      }>
                                        {player.role === 'civilian' ? 'Civilian' :
                                         player.role === 'undercover' ? 'Undercover' : 'Mr. X'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-white">{player.score}</div>
                                    <div className="text-xs text-slate-400">points</div>
                                  </div>
                                </div>
                                {player.word && (
                                  <div className="mt-2 text-sm text-slate-300">
                                    Word: <span className="text-white">{player.word}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Game Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-white/5 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white">{gameState.currentRound}</div>
                            <div className="text-xs text-slate-400">Rounds</div>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white">{gameState.gameStats.totalClues}</div>
                            <div className="text-xs text-slate-400">Clues</div>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white">{gameState.eliminatedPlayers.length}</div>
                            <div className="text-xs text-slate-400">Eliminated</div>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white">{gameState.players.length}</div>
                            <div className="text-xs text-slate-400">Players</div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button onClick={resetGame} className="flex-1 bg-green-500 hover:bg-green-600">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                            <Link to="/local">Back to Menu</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}