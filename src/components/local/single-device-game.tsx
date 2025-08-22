"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { Link, useNavigate } from 'react-router-dom'
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
  Award,
  Shield,
  Swords,
  Timer,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shuffle,
  MessageCircle,
  Search
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

type GamePhase = 'setup' | 'lobby' | 'word-reveal' | 'description' | 'discussion' | 'voting' | 'elimination' | 'mr-white-guess' | 'round-end' | 'game-end'

// Special roles configuration
interface SpecialRole {
  id: string
  name: string
  description: string
  minPlayers: number
  icon: string
  enabled: boolean
}

const SPECIAL_ROLES: SpecialRole[] = [
  {
    id: 'goddess-of-justice',
    name: 'Goddess of Justice',
    description: 'Breaks vote ties (even after elimination)',
    minPlayers: 3,
    icon: '⚖️',
    enabled: false
  },
  {
    id: 'the-lovers',
    name: 'The Lovers',
    description: 'If one is eliminated, both are eliminated',
    minPlayers: 5,
    icon: '💕',
    enabled: false
  },
  {
    id: 'mr-meme',
    name: 'Mr. Meme',
    description: 'Must mime their clue each round',
    minPlayers: 4,
    icon: '🎭',
    enabled: false
  },
  {
    id: 'the-revenger',
    name: 'The Revenger',
    description: 'Can take someone with them when eliminated',
    minPlayers: 5,
    icon: '⚔️',
    enabled: false
  },
  {
    id: 'the-ghost',
    name: 'The Ghost',
    description: 'Eliminated players keep talking and voting',
    minPlayers: 4,
    icon: '👻',
    enabled: false
  }
]

export function SingleDeviceGame() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState<LocalGameState | null>(null)
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('setup')
  const [wordPacks, setWordPacks] = useState<WordPack[]>([])
  const [loading, setLoading] = useState(false)
  
  // Setup state
  const [playerCount, setPlayerCount] = useState(5)
  const [undercoverCount, setUndercoverCount] = useState(1)
  const [mrWhiteCount, setMrWhiteCount] = useState(1)
  const [selectedWordPack, setSelectedWordPack] = useState<string>('')
  const [rounds, setRounds] = useState(3)
  const [votingTimeMinutes, setVotingTimeMinutes] = useState(2)
  const [players, setPlayers] = useState<LocalPlayer[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [specialRoles, setSpecialRoles] = useState<SpecialRole[]>(SPECIAL_ROLES)
  
  // Game state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [votes, setVotes] = useState<{ [playerId: string]: string }>({})
  const [showWord, setShowWord] = useState(false)
  const [votingTimeLeft, setVotingTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0)
  const [mrWhiteGuess, setMrWhiteGuess] = useState('')
  const [showSpecialRoles, setShowSpecialRoles] = useState(false)

  // Load word packs on component mount
  useEffect(() => {
    const loadWordPacks = async () => {
      try {
        const packs = await getWordPacks()
        setWordPacks(packs)
        if (packs.length > 0) {
          setSelectedWordPack(packs[0].id)
        }
      } catch (error) {
        console.error('Failed to load word packs:', error)
      }
    }
    loadWordPacks()
  }, [])

  // Voting timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && votingTimeLeft > 0) {
      interval = setInterval(() => {
        setVotingTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, votingTimeLeft])

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

  const toggleSpecialRole = (roleId: string) => {
    setSpecialRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, enabled: !role.enabled } : role
    ))
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

    if (undercoverCount + mrWhiteCount >= players.length) {
      alert('Too many undercover/Mr. White players! Need at least 1 civilian.')
      return
    }

    setLoading(true)
    
    const config: LocalGameConfig = {
      id: `config-${Date.now()}`,
      playerCount: players.length,
      undercoverCount,
      mrXCount: mrWhiteCount,
      wordPackId: selectedWordPack,
      rounds,
      spectatorVoting: false,
      minigamesEnabled: false,
      observerMode: true,
      discussionTimer: true,
      discussionTimeMinutes: votingTimeMinutes,
      animatedScoreboard: true,
      createdAt: new Date().toISOString()
    }

    const newGameState = createLocalGame(config)
    const playersWithRoles = await assignRolesAndWords(players, config)
    const speakingOrder = generateSpeakingOrder(playersWithRoles)
    
    newGameState.players = playersWithRoles
    newGameState.speakingOrder = speakingOrder
    newGameState.currentPhase = 'lobby'
    
    setGameState(newGameState)
    setCurrentPhase('lobby')
    setPlayers(playersWithRoles)
    setLoading(false)
  }

  const nextPhase = () => {
    if (!gameState) return

    switch (currentPhase) {
      case 'lobby':
        setCurrentPhase('word-reveal')
        setCurrentPlayerIndex(0)
        break
      case 'word-reveal':
        if (currentPlayerIndex < gameState.players.length - 1) {
          setCurrentPlayerIndex(currentPlayerIndex + 1)
          setShowWord(false)
        } else {
          setCurrentPhase('description')
          setCurrentSpeakerIndex(0)
        }
        break
      case 'description':
        if (currentSpeakerIndex < gameState.speakingOrder.length - 1) {
          setCurrentSpeakerIndex(currentSpeakerIndex + 1)
        } else {
          setCurrentPhase('discussion')
        }
        break
      case 'discussion':
        setCurrentPhase('voting')
        setVotes({})
        setVotingTimeLeft(gameState.config.discussionTimeMinutes * 60)
        setTimerActive(true)
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
      case 'mr-white-guess':
        handleMrWhiteGuess()
        break
      case 'round-end':
        // Start new round
        const newRound = gameState.currentRound + 1
        setGameState({
          ...gameState,
          currentRound: newRound,
          currentPhase: 'description'
        })
        setCurrentPhase('description')
        setCurrentSpeakerIndex(0)
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

      // Check if eliminated player is Mr. White
      if (eliminatedPlayer.role === 'mrx') {
        setCurrentPhase('mr-white-guess')
        return
      }
    }

    setCurrentPhase('elimination')
  }

  const handleMrWhiteGuess = () => {
    if (!gameState || !mrWhiteGuess.trim()) {
      alert('Mr. White must make a guess!')
      return
    }

    // Get the civilian word
    const civilianPlayer = gameState.players.find(p => p.role === 'civilian')
    const civilianWord = civilianPlayer?.word?.toLowerCase()
    const guess = mrWhiteGuess.trim().toLowerCase()

    if (guess === civilianWord) {
      // Mr. White wins!
      setCurrentPhase('game-end')
    } else {
      // Continue with normal elimination
      setCurrentPhase('elimination')
    }
  }

  const calculateFinalScores = () => {
    if (!gameState) return []

    const winner = checkWinCondition(gameState.players)
    const civilianPlayer = gameState.players.find(p => p.role === 'civilian')
    const civilianWord = civilianPlayer?.word?.toLowerCase()
    const mrWhiteGuessedCorrectly = mrWhiteGuess.trim().toLowerCase() === civilianWord

    const scoredPlayers = gameState.players.map(player => {
      let score = 0
      let badges: string[] = []

      // Role-based scoring per the reference
      if (player.role === 'civilian') {
        score = 2
        if (winner === 'civilians') {
          badges.push('🏆 Victory')
        }
      } else if (player.role === 'undercover') {
        score = 10
        if (winner === 'undercover') {
          badges.push('🎭 Master of Disguise')
        }
      } else if (player.role === 'mrx') {
        score = 6
        if (winner === 'mrx' || mrWhiteGuessedCorrectly) {
          badges.push('👑 Mr. White Victory')
          score += 4 // Bonus for winning
        }
      }

      // Survival bonus
      if (!player.isEliminated) {
        badges.push('🛡️ Survivor')
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
    setVotingTimeLeft(0)
    setTimerActive(false)
    setCurrentSpeakerIndex(0)
    setMrWhiteGuess('')
    setPlayers([])
  }

  if (currentPhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
                <Link to="/local" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Local Games
                </Link>
              </Button>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Undercover: Pass & Play
              </h1>
              <p className="text-xl text-gray-300">
                Configure your game settings and add players for the ultimate word deduction experience
              </p>
            </div>

            <BentoGrid className="max-w-6xl mx-auto">
              {/* Game Settings */}
              <BentoGridItem
                className="md:col-span-2 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl border-white/10"
                title={
                  <div className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5" />
                    Game Configuration
                  </div>
                }
                description="Set up the perfect game for your group"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm"></div>
                }
              >
                <div className="space-y-6 text-white">
                  {/* Player Count */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Number of Players
                    </label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
                        disabled={playerCount <= 3}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-2xl text-cyan-400">{playerCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                        disabled={playerCount >= 20}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Undercover Count */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Undercover Players
                    </label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUndercoverCount(Math.max(1, undercoverCount - 1))}
                        disabled={undercoverCount <= 1}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-2xl text-purple-400">{undercoverCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUndercoverCount(Math.min(Math.floor(playerCount/3), undercoverCount + 1))}
                        disabled={undercoverCount >= Math.floor(playerCount/3)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mr. White Count */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Mr. White Players
                    </label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMrWhiteCount(Math.max(0, mrWhiteCount - 1))}
                        disabled={mrWhiteCount <= 0}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-2xl text-yellow-400">{mrWhiteCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setMrWhiteCount(Math.min(2, mrWhiteCount + 1))}
                        disabled={mrWhiteCount >= 2}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Voting Time */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Voting Time (minutes)
                    </label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVotingTimeMinutes(Math.max(1, votingTimeMinutes - 1))}
                        disabled={votingTimeMinutes <= 1}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-2xl text-green-400">{votingTimeMinutes}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVotingTimeMinutes(Math.min(10, votingTimeMinutes + 1))}
                        disabled={votingTimeMinutes >= 10}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Word Pack Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-red-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Choose from Word Pack *
                    </label>
                    <select
                      value={selectedWordPack}
                      onChange={(e) => setSelectedWordPack(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white backdrop-blur-sm"
                      required
                    >
                      <option value="" className="bg-gray-800">Select a word pack...</option>
                      {wordPacks.map(pack => (
                        <option key={pack.id} value={pack.id} disabled={pack.type === 'ai'} className="bg-gray-800">
                          {pack.title} {pack.type === 'ai' ? '(Coming Soon)' : `(${pack.difficulty})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </BentoGridItem>

              {/* Players */}
              <BentoGridItem
                className="bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-xl border-white/10"
                title={
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    Players ({players.length}/{playerCount})
                  </div>
                }
                description="Add players to join the game"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm"></div>
                }
              >
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter unique player name"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-300 backdrop-blur-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <Button 
                      onClick={addPlayer} 
                      disabled={!newPlayerName.trim() || players.length >= playerCount || players.find(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase())}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.map((player, index) => (
                      <motion.div 
                        key={player.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="font-medium text-white">{player.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)} className="text-red-400 hover:bg-red-400/20">
                          <Minus className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </BentoGridItem>

              {/* Special Roles */}
              <BentoGridItem
                className="md:col-span-3 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-white/10"
                title={
                  <div className="flex items-center gap-2 text-white">
                    <Swords className="w-5 h-5" />
                    Special Roles (Optional)
                  </div>
                }
                description="Add special roles for more complex gameplay"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm"></div>
                }
              >
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowSpecialRoles(!showSpecialRoles)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {showSpecialRoles ? 'Hide' : 'Show'} Special Roles
                  </Button>
                  
                  {showSpecialRoles && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {specialRoles.map(role => (
                        <div
                          key={role.id}
                          className={`p-4 rounded-xl border transition-all ${
                            role.enabled 
                              ? 'bg-purple-500/20 border-purple-400/50' 
                              : 'bg-white/5 border-white/10'
                          } ${players.length < role.minPlayers ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{role.icon}</span>
                              <span className="font-medium text-white">{role.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleSpecialRole(role.id)}
                              disabled={players.length < role.minPlayers}
                              className={`border-white/20 ${
                                role.enabled 
                                  ? 'bg-purple-500/30 text-white' 
                                  : 'text-white hover:bg-white/10'
                              }`}
                            >
                              {role.enabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-300">{role.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Min {role.minPlayers} players</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </BentoGridItem>

              {/* Start Game */}
              <BentoGridItem
                className="md:col-span-3 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-xl border-white/10"
                title={
                  <div className="flex items-center gap-2 text-white">
                    <Play className="w-5 h-5" />
                    Ready to Start?
                  </div>
                }
                description="All set? Let's begin the ultimate word deduction game!"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm"></div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400">{players.length}</div>
                      <div className="text-xs text-gray-300">Players</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-2xl font-bold text-purple-400">{undercoverCount}</div>
                      <div className="text-xs text-gray-300">Undercover</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-400">{mrWhiteCount}</div>
                      <div className="text-xs text-gray-300">Mr. White</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-2xl font-bold text-green-400">{players.length - undercoverCount - mrWhiteCount}</div>
                      <div className="text-xs text-gray-300">Civilians</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full py-4 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl" 
                    onClick={startGame} 
                    disabled={loading || players.length < 3 || !selectedWordPack}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Starting Game...
                      </div>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Undercover Game
                      </>
                    )}
                  </Button>
                </div>
              </BentoGridItem>
            </BentoGrid>
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
  const currentSpeaker = gameState.speakingOrder[currentSpeakerIndex] ? 
    gameState.players.find(p => p.id === gameState.speakingOrder[currentSpeakerIndex]) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Game Lobby */}
          {currentPhase === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-6xl mb-4">🎭</div>
                  <CardTitle className="text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Game Starting!
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300">
                    Get ready for the ultimate word deduction experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-cyan-400">{gameState.players.length}</div>
                      <div className="text-sm text-gray-300">Total Players</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-purple-400">{gameState.config.undercoverCount}</div>
                      <div className="text-sm text-gray-300">Undercover</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-yellow-400">{gameState.config.mrXCount}</div>
                      <div className="text-sm text-gray-300">Mr. White</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-2xl font-bold text-green-400">
                        {gameState.players.length - gameState.config.undercoverCount - gameState.config.mrXCount}
                      </div>
                      <div className="text-sm text-gray-300">Civilians</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                    <h3 className="text-lg font-semibold mb-3">How to Play:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl mb-2">👁️</div>
                        <div className="font-medium">1. See Your Word</div>
                        <div className="text-gray-300">Pass phone privately</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">💬</div>
                        <div className="font-medium">2. Give Clues</div>
                        <div className="text-gray-300">Describe your word</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🗳️</div>
                        <div className="font-medium">3. Vote</div>
                        <div className="text-gray-300">Eliminate suspects</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={nextPhase} size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-8 py-4">
                    <Eye className="w-5 h-5 mr-2" />
                    Start Word Reveals
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Word Reveal Phase */}
          {currentPhase === 'word-reveal' && currentPlayer && (
            <motion.div
              key="word-reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-green-900/80 to-blue-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
                  <CardTitle className="text-3xl">{currentPlayer.name}</CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    Player {currentPlayerIndex + 1} of {gameState.players.length} • Pass the phone privately
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-yellow-200 font-medium">
                      🔒 Privacy Mode: Others should look away while you view your word
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWord(!showWord)}
                      className="text-xl px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      {showWord ? (
                        <>
                          <EyeOff className="w-6 h-6 mr-3" />
                          Hide My Word
                        </>
                      ) : (
                        <>
                          <Eye className="w-6 h-6 mr-3" />
                          Reveal My Word
                        </>
                      )}
                    </Button>
                    
                    {showWord && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 rounded-2xl border border-white/20 backdrop-blur-sm"
                      >
                        <p className="text-lg mb-3 text-gray-300">Your secret word is:</p>
                        <p className="text-5xl font-bold mb-4">
                          {currentPlayer.word || '❓ NO WORD'}
                        </p>
                        {currentPlayer.role === 'mrx' && (
                          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mt-4">
                            <p className="text-red-200 font-medium">
                              🎭 You are Mr. White! You have no word - listen carefully and try to guess the civilian word!
                            </p>
                          </div>
                        )}
                        {currentPlayer.role === 'undercover' && (
                          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 mt-4">
                            <p className="text-purple-200 text-sm">
                              💡 Give clues that fit your word but don't reveal you're different from the majority
                            </p>
                          </div>
                        )}
                        {currentPlayer.role === 'civilian' && (
                          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mt-4">
                            <p className="text-blue-200 text-sm">
                              🕵️ Work with other civilians to find the undercover players and Mr. White
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={nextPhase} size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      {currentPlayerIndex < gameState.players.length - 1 ? 'Next Player' : 'Start Descriptions'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Description Phase */}
          {currentPhase === 'description' && currentSpeaker && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-orange-900/80 to-red-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-6xl mb-4">{currentSpeaker.avatar}</div>
                  <CardTitle className="text-3xl flex items-center justify-center gap-2">
                    <MessageCircle className="w-8 h-8" />
                    {currentSpeaker.name}'s Turn
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    Speaker {currentSpeakerIndex + 1} of {gameState.speakingOrder.length} • Give a short clue about your word
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-semibold mb-3">🎯 Description Guidelines:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <div className="font-medium text-green-400 mb-1">✅ Good Clues:</div>
                        <ul className="text-gray-300 space-y-1">
                          <li>• One word or short phrase</li>
                          <li>• Truthful about your word</li>
                          <li>• Help allies identify you</li>
                        </ul>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-red-400 mb-1">❌ Avoid:</div>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Direct synonyms</li>
                          <li>• Obvious giveaways</li>
                          <li>• Lying about your word</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl mb-4">🎤</p>
                    <p className="text-lg text-gray-300 mb-6">
                      <strong>{currentSpeaker.name}</strong>, give your clue out loud to everyone!
                    </p>
                    <p className="text-sm text-gray-400">
                      Take your time to think of a good clue that helps your team
                    </p>
                  </div>
                  
                  <Button onClick={nextPhase} size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {currentSpeakerIndex < gameState.speakingOrder.length - 1 ? 'Next Speaker' : 'Start Discussion'}
                  </Button>
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
              <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-4xl flex items-center justify-center gap-3">
                    <MessageCircle className="w-10 h-10" />
                    Discussion Time
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300">
                    Analyze the clues and figure out who might be the imposters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-semibold mb-4">🕵️ Discussion Strategy:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🤝</div>
                        <div className="font-medium text-blue-400">Find Allies</div>
                        <div className="text-gray-300">Look for similar clues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="font-medium text-yellow-400">Spot Differences</div>
                        <div className="text-gray-300">Find odd clues out</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">❓</div>
                        <div className="font-medium text-red-400">Question Suspects</div>
                        <div className="text-gray-300">Ask for clarification</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {alivePlayers.map(player => (
                      <motion.div 
                        key={player.id} 
                        whileHover={{ scale: 1.05 }}
                        className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10"
                      >
                        <div className="text-3xl mb-2">{player.avatar}</div>
                        <div className="text-sm font-medium">{player.name}</div>
                        <div className="text-xs text-gray-400">Alive</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-yellow-200">
                      💡 <strong>Remember:</strong> Civilians want to eliminate Undercover & Mr. White. 
                      Undercover wants to survive. Mr. White can win by guessing the civilian word!
                    </p>
                  </div>
                  
                  <Button onClick={nextPhase} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
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
              <Card className="bg-gradient-to-br from-red-900/80 to-orange-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-4xl flex items-center justify-center gap-3">
                    <Vote className="w-10 h-10" />
                    Voting Time
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300">
                    Vote to eliminate who you think is an imposter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {timerActive && (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-red-400 mb-2">
                        {Math.floor(votingTimeLeft / 60)}:{(votingTimeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-gray-300">Time remaining</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alivePlayers.map(player => {
                      const voteCount = Object.values(votes).filter(vote => vote === player.id).length
                      return (
                        <motion.div
                          key={player.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={voteCount > 0 ? "default" : "outline"}
                            onClick={() => {
                              const voterId = `voter-${Date.now()}-${Math.random()}`
                              setVotes({ ...votes, [voterId]: player.id })
                            }}
                            className={`w-full p-6 h-auto ${
                              voteCount > 0 
                                ? 'bg-red-600 hover:bg-red-700 border-red-500' 
                                : 'border-white/30 text-white hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{player.avatar}</span>
                                <span className="font-medium text-lg">{player.name}</span>
                              </div>
                              {voteCount > 0 && (
                                <Badge className="bg-red-800 text-white">
                                  {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  <div className="text-center space-y-4">
                    <p className="text-lg">
                      Votes cast: <span className="font-bold text-red-400">{Object.keys(votes).length}</span> / {alivePlayers.length}
                    </p>
                    <Button 
                      onClick={nextPhase} 
                      disabled={Object.keys(votes).length < alivePlayers.length}
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 disabled:opacity-50"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Eliminate Player
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mr. White Guess Phase */}
          {currentPhase === 'mr-white-guess' && (
            <motion.div
              key="mr-white-guess"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-yellow-900/80 to-orange-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-6xl mb-4">👑</div>
                  <CardTitle className="text-4xl text-yellow-400">Mr. White's Last Chance!</CardTitle>
                  <CardDescription className="text-xl text-gray-300">
                    Mr. White was eliminated but can still win by guessing the civilian word
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3">🎯 Final Guess:</h3>
                    <p className="text-gray-300 mb-4">
                      Based on all the clues you heard, what do you think the civilian word is?
                    </p>
                    <input
                      type="text"
                      value={mrWhiteGuess}
                      onChange={(e) => setMrWhiteGuess(e.target.value)}
                      placeholder="Enter your guess..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-300 backdrop-blur-sm text-center text-xl"
                      onKeyPress={(e) => e.key === 'Enter' && nextPhase()}
                    />
                  </div>
                  
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-red-200">
                      ⚠️ <strong>Warning:</strong> If you guess correctly, you win the entire game! 
                      If you're wrong, the civilians win.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={nextPhase} 
                    disabled={!mrWhiteGuess.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Submit Guess
                  </Button>
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
              <Card className="bg-gradient-to-br from-gray-900/80 to-red-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-6xl mb-4">{eliminatedPlayer.avatar}</div>
                  <CardTitle className="text-4xl text-red-400">
                    {eliminatedPlayer.name} Eliminated!
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300">
                    They received {eliminatedPlayer.votesReceived} votes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                    <p className="text-2xl font-semibold mb-3">
                      {eliminatedPlayer.name} was: <span className="text-red-400">{eliminatedPlayer.role.toUpperCase()}</span>
                    </p>
                    {eliminatedPlayer.word && (
                      <p className="text-lg text-gray-300">
                        Their word was: <strong className="text-white">{eliminatedPlayer.word}</strong>
                      </p>
                    )}
                    {eliminatedPlayer.role === 'mrx' && (
                      <p className="text-lg text-gray-300">
                        They had no word and were trying to blend in!
                      </p>
                    )}
                  </div>
                  
                  {mrWhiteGuess && (
                    <div className="p-6 bg-yellow-500/20 border border-yellow-400/30 rounded-xl backdrop-blur-sm">
                      <p className="text-xl font-semibold mb-2">Mr. White's Guess:</p>
                      <p className="text-2xl font-bold text-yellow-400 mb-2">"{mrWhiteGuess}"</p>
                      <p className="text-lg">
                        {mrWhiteGuess.toLowerCase() === gameState.players.find(p => p.role === 'civilian')?.word?.toLowerCase() 
                          ? '✅ CORRECT! Mr. White wins!' 
                          : '❌ Wrong guess. Game continues.'}
                      </p>
                    </div>
                  )}
                  
                  <Button onClick={nextPhase} size="lg" className="bg-gradient-to-r from-gray-600 to-red-600 hover:from-gray-700 hover:to-red-700">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {winner || gameState.currentRound >= gameState.config.rounds ? 'View Final Results' : 'Continue Game'}
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
              <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl border-white/20 text-white">
                <CardHeader>
                  <div className="text-8xl mb-6">🏆</div>
                  <CardTitle className="text-5xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                    Game Over!
                  </CardTitle>
                  <CardDescription className="text-2xl text-gray-300">
                    {winner === 'civilians' && '🕵️ Civilians Win! All imposters eliminated!'}
                    {winner === 'undercover' && '🎭 Undercover Wins! They survived to the end!'}
                    {winner === 'mrx' && '👑 Mr. White Wins! Correct word guess!'}
                    {!winner && '🎉 Game Complete!'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold mb-6">🏅 Final Scores</h3>
                    {calculateFinalScores().map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-2xl border ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50' 
                            : 'bg-white/10 border-white/20'
                        } backdrop-blur-sm`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {index === 0 && <Crown className="w-8 h-8 text-yellow-400" />}
                            <span className="text-4xl">{player.avatar}</span>
                            <div className="text-left">
                              <div className="text-xl font-semibold">{player.name}</div>
                              <div className="text-sm text-gray-300 capitalize">
                                {player.role === 'mrx' ? 'Mr. White' : player.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-yellow-400">{player.score}</div>
                            <div className="text-sm text-gray-300">points</div>
                          </div>
                        </div>
                        {player.badges.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {player.badges.map((badge, idx) => (
                              <Badge key={idx} className="bg-white/20 text-white border-white/30">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                    <h4 className="text-lg font-semibold mb-2">📊 Scoring System:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">+2</div>
                        <div className="text-gray-300">Civilian Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">+6</div>
                        <div className="text-gray-300">Mr. White Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">+10</div>
                        <div className="text-gray-300">Undercover Points</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={resetGame} size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Play Again
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => navigate('/')}
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Home
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