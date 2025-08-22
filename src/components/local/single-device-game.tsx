"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Play, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus,
  Crown,
  Target,
  Clock,
  Vote,
  Trophy,
  Home,
  RotateCcw,
  Sparkles,
  Zap,
  Star,
  Award
} from 'lucide-react'
import { 
  LocalGameConfig, 
  LocalGameState, 
  LocalPlayer,
  createLocalGame,
  assignRolesAndWords,
  generateSpeakingOrder,
  calculateElimination,
  checkWinCondition,
  getRandomAvatar,
  getWordPacks,
  WordPack
} from '@/lib/supabase-local-game'

type GamePhase = 'setup' | 'onboarding' | 'role-reveal' | 'clue-giving' | 'discussion' | 'voting' | 'elimination' | 'round-end' | 'game-end'

export function SingleDeviceGame() {
  const [gameState, setGameState] = useState<LocalGameState | null>(null)
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('setup')
  const [wordPacks, setWordPacks] = useState<WordPack[]>([])
  const [loading, setLoading] = useState(false)
  
  // Setup state
  const [playerCount, setPlayerCount] = useState(5)
  const [undercoverCount, setUndercoverCount] = useState(1)
  const [mrXCount, setMrXCount] = useState(0)
  const [selectedWordPack, setSelectedWordPack] = useState<string>('')
  const [rounds, setRounds] = useState(3)
  const [discussionTimeMinutes, setDiscussionTimeMinutes] = useState(2)
  const [players, setPlayers] = useState<LocalPlayer[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  
  // Game state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [votes, setVotes] = useState<{ [playerId: string]: string }>({})
  const [showWord, setShowWord] = useState(false)
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

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

  // Discussion timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && discussionTimeLeft > 0) {
      interval = setInterval(() => {
        setDiscussionTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, discussionTimeLeft])

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase())) {
      const newPlayer: LocalPlayer = {
        id: `player-${Date.now()}`,
        name: newPlayerName.trim(),
        avatar: getRandomAvatar(),
        role: 'civilian',
        isEliminated: false,
        score: 0,
        cluesGiven: [],
        votesReceived: 0,
        badges: []
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName('')
    }
  }

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId))
  }

  const startGame = async () => {
    if (!selectedWordPack) {
      alert('Please choose a word pack to continue!')
      return
    }
    
    if (players.length < 3) {
      alert('Need at least 3 players to start!')
      return
    }

    setLoading(true)
    
    const config: LocalGameConfig = {
      id: `config-${Date.now()}`,
      playerCount: players.length,
      undercoverCount,
      mrXCount,
      wordPackId: selectedWordPack,
      rounds,
      spectatorVoting: false,
      minigamesEnabled: false,
      observerMode: true,
      discussionTimer: true,
      discussionTimeMinutes,
      animatedScoreboard: true,
      createdAt: new Date().toISOString()
    }

    const newGameState = createLocalGame(config)
    const playersWithRoles = await assignRolesAndWords(players, config)
    const speakingOrder = generateSpeakingOrder(playersWithRoles)
    
    newGameState.players = playersWithRoles
    newGameState.speakingOrder = speakingOrder
    newGameState.currentPhase = 'onboarding'
    
    setGameState(newGameState)
    setCurrentPhase('onboarding')
    setPlayers(playersWithRoles)
    setLoading(false)
  }

  const nextPhase = () => {
    if (!gameState) return

    switch (currentPhase) {
      case 'onboarding':
        setCurrentPhase('role-reveal')
        setCurrentPlayerIndex(0)
        break
      case 'role-reveal':
        if (currentPlayerIndex < gameState.players.length - 1) {
          setCurrentPlayerIndex(currentPlayerIndex + 1)
        } else {
          setCurrentPhase('discussion')
          setDiscussionTimeLeft(gameState.config.discussionTimeMinutes * 60)
          setTimerActive(true)
        }
        break
      case 'discussion':
        setCurrentPhase('voting')
        setVotes({})
        break
      case 'voting':
        handleElimination()
        break
      case 'elimination':
        const winner = checkWinCondition(gameState.players)
        if (winner || gameState.currentRound >= gameState.config.rounds) {
          setCurrentPhase('game-end')
        } else {
          setCurrentPhase('round-end')
        }
        break
      case 'round-end':
        // Start new round
        const newRound = gameState.currentRound + 1
        setGameState({
          ...gameState,
          currentRound: newRound,
          currentPhase: 'discussion'
        })
        setCurrentPhase('discussion')
        setDiscussionTimeLeft(gameState.config.discussionTimeMinutes * 60)
        setTimerActive(true)
        setVotes({})
        break
    }
  }

  const handleElimination = () => {
    if (!gameState) return

    const voteCount = Object.keys(votes).length
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    
    if (voteCount < alivePlayers.length) {
      alert('All players must vote!')
      return
    }

    // Check for ties
    const voteCounts: { [playerId: string]: number } = {}
    Object.values(votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
    })

    const maxVotes = Math.max(...Object.values(voteCounts))
    const playersWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes)

    if (playersWithMaxVotes.length > 1) {
      // Tie - ask for revote
      alert(`Tie between ${playersWithMaxVotes.length} players! Please vote again.`)
      setVotes({})
      return
    }

    const eliminatedPlayer = gameState.players.find(p => p.id === playersWithMaxVotes[0])
    if (eliminatedPlayer) {
      eliminatedPlayer.isEliminated = true
      eliminatedPlayer.votesReceived = maxVotes
      
      setGameState({
        ...gameState,
        players: gameState.players.map(p => 
          p.id === eliminatedPlayer.id ? eliminatedPlayer : p
        ),
        eliminatedPlayers: [...gameState.eliminatedPlayers, eliminatedPlayer]
      })
    }

    setCurrentPhase('elimination')
  }

  const calculateFinalScores = () => {
    if (!gameState) return []

    const winner = checkWinCondition(gameState.players)
    const scoredPlayers = gameState.players.map(player => {
      let score = 0
      let badges: string[] = []

      // Base survival points
      if (!player.isEliminated) {
        score += 100
        badges.push('🏆 Survivor')
      }

      // Role-based scoring
      if (winner === 'civilians' && player.role === 'civilian') {
        score += 150
        badges.push('🕵️ Detective')
      } else if (winner === 'undercover' && player.role === 'undercover') {
        score += 200
        badges.push('🎭 Master of Disguise')
      } else if (winner === 'mrx' && player.role === 'mrx') {
        score += 250
        badges.push('👑 Mr. X Victory')
      }

      // Participation points
      score += player.cluesGiven.length * 10

      // Penalty for being eliminated early
      if (player.isEliminated) {
        score = Math.max(0, score - 50)
      }

      return {
        ...player,
        score,
        badges
      }
    })

    return scoredPlayers.sort((a, b) => b.score - a.score)
  }

  const resetGame = () => {
    setGameState(null)
    setCurrentPhase('setup')
    setCurrentPlayerIndex(0)
    setVotes({})
    setShowWord(false)
    setDiscussionTimeLeft(0)
    setTimerActive(false)
    setPlayers([])
  }

  if (currentPhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Button variant="ghost" className="mb-4">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Local Multiplayer Setup
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your game settings and add players
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Game Settings */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Game Setup
                  </CardTitle>
                  <CardDescription>Configure the game rules and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Number of Players */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Number of Players</label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
                        disabled={playerCount <= 3}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">{playerCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                        disabled={playerCount >= 20}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Undercover Count */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Undercover Players</label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUndercoverCount(Math.max(1, undercoverCount - 1))}
                        disabled={undercoverCount <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">{undercoverCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUndercoverCount(Math.min(Math.floor(playerCount/2), undercoverCount + 1))}
                        disabled={undercoverCount >= Math.floor(playerCount/2)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mr. X Count */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Mr. X Players</label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMrXCount(Math.max(0, mrXCount - 1))}
                        disabled={mrXCount <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">{mrXCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMrXCount(Math.min(2, mrXCount + 1))}
                        disabled={mrXCount >= 2}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rounds */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Rounds</label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setRounds(Math.max(3, rounds - 2))}
                        disabled={rounds <= 3}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">{rounds}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setRounds(Math.min(7, rounds + 2))}
                        disabled={rounds >= 7}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Discussion Time */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Discussion Time (minutes)</label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDiscussionTimeMinutes(Math.max(1, discussionTimeMinutes - 1))}
                        disabled={discussionTimeMinutes <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg">{discussionTimeMinutes}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDiscussionTimeMinutes(Math.min(10, discussionTimeMinutes + 1))}
                        disabled={discussionTimeMinutes >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-red-600">Choose from Word Pack *</label>
                    <select
                      value={selectedWordPack}
                      onChange={(e) => setSelectedWordPack(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    >
                      <option value="">Select a word pack...</option>
                      {wordPacks.map(pack => (
                        <option key={pack.id} value={pack.id} disabled={pack.type === 'ai'}>
                          {pack.title} {pack.type === 'ai' ? '(Coming Soon)' : `(${pack.difficulty})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coming Soon Features */}
                  <div className="space-y-3 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Minigames for Eliminated Civilians</span>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Animated Scoreboard</span>
                      <Badge className="bg-green-100 text-green-800">Always On</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Players */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Players ({players.length}/{playerCount})
                  </CardTitle>
                  <CardDescription>Add players to the game</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name/username"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <Button onClick={addPlayer} disabled={!newPlayerName.trim() || players.length >= playerCount}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={startGame} 
                    disabled={loading || players.length < 3 || !selectedWordPack}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Starting Game...
                      </div>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  const currentPlayer = gameState.players[currentPlayerIndex]
  const alivePlayers = gameState.players.filter(p => !p.isEliminated)
  const eliminatedPlayer = gameState.eliminatedPlayers[gameState.eliminatedPlayers.length - 1]
  const winner = checkWinCondition(gameState.players)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Onboarding Phase */}
          {currentPhase === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl">Game Starting!</CardTitle>
                  <CardDescription className="text-lg">
                    Each player will see their secret word. Keep it hidden from others!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-6xl">🎭</div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Players: {gameState.players.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Round {gameState.currentRound} of {gameState.config.rounds}
                    </p>
                  </div>
                  <Button onClick={nextPhase} size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Role Reveal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Role Reveal Phase */}
          {currentPhase === 'role-reveal' && currentPlayer && (
            <motion.div
              key="role-reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
                  <CardTitle className="text-2xl">{currentPlayer.name}</CardTitle>
                  <CardDescription>
                    Player {currentPlayerIndex + 1} of {gameState.players.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWord(!showWord)}
                      className="text-lg px-8 py-4"
                    >
                      {showWord ? (
                        <>
                          <EyeOff className="w-5 h-5 mr-2" />
                          Hide My Word
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Show My Word
                        </>
                      )}
                    </Button>
                    
                    {showWord && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white"
                      >
                        <p className="text-sm mb-2">Your word is:</p>
                        <p className="text-4xl font-bold">
                          {currentPlayer.word || 'No word assigned'}
                        </p>
                        {currentPlayer.role === 'mrx' && (
                          <p className="text-sm mt-2 opacity-90">
                            You have no word - try to blend in!
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={nextPhase} size="lg">
                      {currentPlayerIndex < gameState.players.length - 1 ? 'Next Player' : 'Start Discussion'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Discussion Phase */}
          {currentPhase === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center justify-center gap-2">
                    <Clock className="w-8 h-8" />
                    Discussion Time
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Discuss the clues and figure out who might be the undercover player
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-6xl font-bold text-blue-600">
                    {Math.floor(discussionTimeLeft / 60)}:{(discussionTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {alivePlayers.map(player => (
                      <div key={player.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-1">{player.avatar}</div>
                        <div className="text-sm font-medium">{player.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Button onClick={nextPhase} size="lg">
                    <Vote className="w-5 h-5 mr-2" />
                    Start Voting
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Voting Phase */}
          {currentPhase === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center justify-center gap-2">
                    <Vote className="w-8 h-8" />
                    Voting Time
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Vote to eliminate who you think is the undercover player
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alivePlayers.map(player => (
                      <Button
                        key={player.id}
                        variant={Object.values(votes).includes(player.id) ? "default" : "outline"}
                        onClick={() => {
                          const voterId = `voter-${Date.now()}-${Math.random()}`
                          setVotes({ ...votes, [voterId]: player.id })
                        }}
                        className="p-4 h-auto"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Votes cast: {Object.keys(votes).length} / {alivePlayers.length}
                    </p>
                    <Button 
                      onClick={nextPhase} 
                      disabled={Object.keys(votes).length < alivePlayers.length}
                      size="lg"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Eliminate Player
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Elimination Phase */}
          {currentPhase === 'elimination' && eliminatedPlayer && (
            <motion.div
              key="elimination"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="text-6xl mb-4">{eliminatedPlayer.avatar}</div>
                  <CardTitle className="text-3xl text-red-600">
                    {eliminatedPlayer.name} Eliminated!
                  </CardTitle>
                  <CardDescription className="text-lg">
                    They received {eliminatedPlayer.votesReceived} votes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-lg font-semibold mb-2">
                      {eliminatedPlayer.name} was: {eliminatedPlayer.role.toUpperCase()}
                    </p>
                    {eliminatedPlayer.word && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Their word was: <strong>{eliminatedPlayer.word}</strong>
                      </p>
                    )}
                  </div>
                  
                  <Button onClick={nextPhase} size="lg">
                    {winner || gameState.currentRound >= gameState.config.rounds ? 'View Results' : 'Continue Game'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game End Phase */}
          {currentPhase === 'game-end' && (
            <motion.div
              key="game-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="text-6xl mb-4">🏆</div>
                  <CardTitle className="text-4xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    Game Over!
                  </CardTitle>
                  <CardDescription className="text-xl">
                    {winner === 'civilians' && 'Civilians Win!'}
                    {winner === 'undercover' && 'Undercover Wins!'}
                    {winner === 'mrx' && 'Mr. X Wins!'}
                    {!winner && 'Game Complete!'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Final Scores</h3>
                    {calculateFinalScores().map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                            : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {index === 0 && <Crown className="w-6 h-6" />}
                            <span className="text-2xl">{player.avatar}</span>
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm opacity-75">
                                {player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{player.score}</div>
                            <div className="text-xs opacity-75">points</div>
                          </div>
                        </div>
                        {player.badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {player.badges.map((badge, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetGame} size="lg">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Play Again
                    </Button>
                    <Button variant="outline" size="lg">
                      <Link to="/" className="flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Home
                      </Link>
                    </Button>
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