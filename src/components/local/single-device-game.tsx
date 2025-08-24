"use client"
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Timeline } from '@/components/ui/timeline'
import { Meteors } from '@/components/ui/meteors'
import { Spotlight } from '@/components/ui/spotlight'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { getWordPacks, WordPack, getRandomAvatar } from '@/lib/supabase-local-game'
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Play, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff, 
  Timer, 
  Vote, 
  Trophy,
  Home,
  Crown,
  Shield,
  Zap,
  Star,
  Target,
  Heart,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react'

interface Player {
  id: string
  name: string
  avatar: string
  role: 'civilian' | 'undercover' | 'mrwhite'
  word?: string
  isEliminated: boolean
  score: number
  votesReceived: number
}

interface GameConfig {
  playerCount: number
  undercoverCount: number
  mrWhiteCount: number
  wordPackId: string
  votingTime: number
  specialRoles: string[]
}

interface GameState {
  phase: 'setup' | 'lobby' | 'word-reveal' | 'description' | 'discussion' | 'voting' | 'mr-white-guess' | 'results' | 'final-results'
  players: Player[]
  currentPlayerIndex: number
  currentRound: number
  votes: { [playerId: string]: string }
  eliminatedThisRound: Player | null
  gameWinner: 'civilians' | 'impostors' | 'mrwhite' | null
  mrWhiteGuess: string
  timeLeft: number
  isRevote: boolean
}

const specialRolesList = [
  { id: 'goddess', name: 'Goddess of Justice', description: 'Breaks vote ties even after elimination', minPlayers: 3 },
  { id: 'lovers', name: 'The Lovers', description: 'If one is eliminated, both are eliminated', minPlayers: 5 },
  { id: 'meme', name: 'Mr. Meme', description: 'Must mime their clue each round', minPlayers: 4 },
  { id: 'revenger', name: 'The Revenger', description: 'Can take someone with them when eliminated', minPlayers: 5 },
  { id: 'ghost', name: 'The Ghost', description: 'Eliminated players keep talking and voting', minPlayers: 4 }
]

export function SingleDeviceGame() {
  const navigate = useNavigate()
  const [wordPacks, setWordPacks] = useState<WordPack[]>([])
  const [loading, setLoading] = useState(true)
  
  // Game Configuration
  const [config, setConfig] = useState<GameConfig>({
    playerCount: 6,
    undercoverCount: 1,
    mrWhiteCount: 1,
    wordPackId: '',
    votingTime: 60,
    specialRoles: []
  })
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    votes: {},
    eliminatedThisRound: null,
    gameWinner: null,
    mrWhiteGuess: '',
    timeLeft: 0,
    isRevote: false
  })
  
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showWord, setShowWord] = useState(false)
  const [currentRevealPlayer, setCurrentRevealPlayer] = useState(0)

  // Load word packs
  useEffect(() => {
    const loadWordPacks = async () => {
      try {
        const packs = await getWordPacks()
        setWordPacks(packs)
        if (packs.length > 0) {
          setConfig(prev => ({ ...prev, wordPackId: packs[0].id }))
        }
      } catch (error) {
        console.error('Failed to load word packs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadWordPacks()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState.timeLeft > 0 && (gameState.phase === 'voting' || gameState.phase === 'discussion')) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState.timeLeft, gameState.phase])

  // Auto-advance when timer ends
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.phase === 'voting') {
      handleVotingComplete()
    }
  }, [gameState.timeLeft, gameState.phase])

  const addPlayer = () => {
    if (!newPlayerName.trim()) return
    if (gameState.players.some(p => p.name.toLowerCase() === newPlayerName.toLowerCase())) {
      alert('Player name must be unique!')
      return
    }
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      avatar: getRandomAvatar(),
      role: 'civilian',
      isEliminated: false,
      score: 0,
      votesReceived: 0
    }
    
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }))
    setNewPlayerName('')
  }

  const removePlayer = (playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }))
  }

  const assignRolesAndWords = async () => {
    const selectedPack = wordPacks.find(pack => pack.id === config.wordPackId)
    if (!selectedPack || selectedPack.wordPairs.length === 0) return

    const randomPair = selectedPack.wordPairs[Math.floor(Math.random() * selectedPack.wordPairs.length)]
    const shuffledPlayers = [...gameState.players].sort(() => Math.random() - 0.5)
    
    // Assign Mr. White
    for (let i = 0; i < config.mrWhiteCount; i++) {
      shuffledPlayers[i].role = 'mrwhite'
      shuffledPlayers[i].word = undefined
    }
    
    // Assign Undercover
    for (let i = config.mrWhiteCount; i < config.mrWhiteCount + config.undercoverCount; i++) {
      shuffledPlayers[i].role = 'undercover'
      shuffledPlayers[i].word = randomPair.undercover
    }
    
    // Assign Civilians
    for (let i = config.mrWhiteCount + config.undercoverCount; i < shuffledPlayers.length; i++) {
      shuffledPlayers[i].role = 'civilian'
      shuffledPlayers[i].word = randomPair.civilian
    }
    
    setGameState(prev => ({
      ...prev,
      players: shuffledPlayers,
      phase: 'lobby'
    }))
  }

  const startWordReveal = () => {
    setCurrentRevealPlayer(0)
    setShowWord(false)
    setGameState(prev => ({ ...prev, phase: 'word-reveal' }))
  }

  const nextPlayerReveal = () => {
    if (currentRevealPlayer < gameState.players.length - 1) {
      setCurrentRevealPlayer(prev => prev + 1)
      setShowWord(false)
    } else {
      setGameState(prev => ({ ...prev, phase: 'description', currentPlayerIndex: 0 }))
    }
  }

  const nextDescription = () => {
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    if (gameState.currentPlayerIndex < alivePlayers.length - 1) {
      setGameState(prev => ({ ...prev, currentPlayerIndex: prev.currentPlayerIndex + 1 }))
    } else {
      setGameState(prev => ({ 
        ...prev, 
        phase: 'discussion',
        timeLeft: 120 // 2 minutes discussion
      }))
    }
  }

  const startVoting = () => {
    setGameState(prev => ({ 
      ...prev, 
      phase: 'voting',
      timeLeft: config.votingTime,
      votes: {}
    }))
  }

  const castVote = (voterId: string, targetId: string) => {
    setGameState(prev => ({
      ...prev,
      votes: { ...prev.votes, [voterId]: targetId }
    }))
  }

  const handleVotingComplete = () => {
    const voteCounts: { [playerId: string]: number } = {}
    Object.values(gameState.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
    })

    if (Object.keys(voteCounts).length === 0) {
      // No votes cast, restart voting
      startVoting()
      return
    }

    const maxVotes = Math.max(...Object.values(voteCounts))
    const playersWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes)

    if (playersWithMaxVotes.length > 1 && !gameState.isRevote) {
      // Tie - trigger revote
      setGameState(prev => ({ 
        ...prev, 
        isRevote: true,
        phase: 'voting',
        timeLeft: config.votingTime,
        votes: {}
      }))
      return
    }

    // Eliminate player with most votes (or random if still tied)
    const eliminatedId = playersWithMaxVotes[Math.floor(Math.random() * playersWithMaxVotes.length)]
    const eliminatedPlayer = gameState.players.find(p => p.id === eliminatedId)!
    
    // Update player elimination status
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === eliminatedId ? { ...p, isEliminated: true } : p
      ),
      eliminatedThisRound: eliminatedPlayer,
      isRevote: false
    }))

    // Check if eliminated player is Mr. White
    if (eliminatedPlayer.role === 'mrwhite') {
      setGameState(prev => ({ ...prev, phase: 'mr-white-guess' }))
    } else {
      checkWinCondition()
    }
  }

  const handleMrWhiteGuess = () => {
    const civilianWord = gameState.players.find(p => p.role === 'civilian')?.word
    if (gameState.mrWhiteGuess.toLowerCase().trim() === civilianWord?.toLowerCase()) {
      // Mr. White wins
      setGameState(prev => ({
        ...prev,
        gameWinner: 'mrwhite',
        phase: 'results'
      }))
    } else {
      checkWinCondition()
    }
  }

  const checkWinCondition = () => {
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian')
    const aliveImpostors = alivePlayers.filter(p => p.role === 'undercover' || p.role === 'mrwhite')

    if (aliveImpostors.length === 0) {
      // Civilians win
      setGameState(prev => ({
        ...prev,
        gameWinner: 'civilians',
        phase: 'results'
      }))
    } else if (aliveCivilians.length <= 1) {
      // Impostors win
      setGameState(prev => ({
        ...prev,
        gameWinner: 'impostors',
        phase: 'results'
      }))
    } else {
      // Continue to next round
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        phase: 'description',
        currentPlayerIndex: 0,
        eliminatedThisRound: null
      }))
    }
  }

  const calculateFinalScores = () => {
    return gameState.players.map(player => {
      let roundScore = 0
      if (gameState.gameWinner === 'civilians' && player.role === 'civilian') {
        roundScore = 2
      } else if (gameState.gameWinner === 'impostors' && (player.role === 'undercover' || player.role === 'mrwhite')) {
        roundScore = player.role === 'undercover' ? 10 : 6
      } else if (gameState.gameWinner === 'mrwhite' && player.role === 'mrwhite') {
        roundScore = 10 // 6 base + 4 bonus for guessing correctly
      }
      
      return {
        ...player,
        roundScore,
        totalScore: player.score + roundScore
      }
    }).sort((a, b) => b.totalScore - a.totalScore)
  }

  const resetGame = () => {
    setGameState({
      phase: 'setup',
      players: [],
      currentPlayerIndex: 0,
      currentRound: 1,
      votes: {},
      eliminatedThisRound: null,
      gameWinner: null,
      mrWhiteGuess: '',
      timeLeft: 0,
      isRevote: false
    })
    setCurrentRevealPlayer(0)
    setShowWord(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading word packs...</div>
      </div>
    )
  }

  // Setup Phase
  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        <Meteors number={20} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
                <Link to="/local" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Local Games
                </Link>
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Undercover: Pass & Play
              </h1>
              <p className="text-slate-300">
                Set up your game for 3-20 players on one device
              </p>
            </div>

            <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
              {/* Game Settings */}
              <BentoGridItem
                className="md:col-span-2"
                title="Game Configuration"
                description="Configure your game settings"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center">
                    <Settings className="w-8 h-8 text-neutral-600 dark:text-neutral-300" />
                  </div>
                }
                icon={<Settings className="h-4 w-4 text-neutral-500" />}
              >
                <div className="space-y-4">
                  {/* Player Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Players</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, playerCount: Math.max(3, prev.playerCount - 1) }))}
                        disabled={config.playerCount <= 3}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{config.playerCount}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, playerCount: Math.min(20, prev.playerCount + 1) }))}
                        disabled={config.playerCount >= 20}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Undercover Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Undercover</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, undercoverCount: Math.max(0, prev.undercoverCount - 1) }))}
                        disabled={config.undercoverCount <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{config.undercoverCount}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, undercoverCount: Math.min(3, prev.undercoverCount + 1) }))}
                        disabled={config.undercoverCount >= 3}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Mr. White Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mr. White</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, mrWhiteCount: Math.max(0, prev.mrWhiteCount - 1) }))}
                        disabled={config.mrWhiteCount <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{config.mrWhiteCount}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, mrWhiteCount: Math.min(2, prev.mrWhiteCount + 1) }))}
                        disabled={config.mrWhiteCount >= 2}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Voting Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voting Time (s)</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, votingTime: Math.max(30, prev.votingTime - 15) }))}
                        disabled={config.votingTime <= 30}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{config.votingTime}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfig(prev => ({ ...prev, votingTime: Math.min(180, prev.votingTime + 15) }))}
                        disabled={config.votingTime >= 180}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </BentoGridItem>

              {/* Word Pack Selection */}
              <BentoGridItem
                className="md:col-span-1"
                title="Choose Word Pack *"
                description="Select your word collection"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-200 dark:from-violet-900 dark:to-violet-800 to-violet-100 items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-300" />
                  </div>
                }
                icon={<Sparkles className="h-4 w-4 text-neutral-500" />}
              >
                <select
                  value={config.wordPackId}
                  onChange={(e) => setConfig(prev => ({ ...prev, wordPackId: e.target.value }))}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  required
                >
                  <option value="">Select Word Pack</option>
                  {wordPacks.map(pack => (
                    <option key={pack.id} value={pack.id} className="text-black">
                      {pack.title} ({pack.difficulty})
                    </option>
                  ))}
                </select>
              </BentoGridItem>

              {/* Special Roles */}
              <BentoGridItem
                className="md:col-span-2"
                title="Special Roles (Optional)"
                description="Add special roles for more fun"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-200 dark:from-orange-900 dark:to-orange-800 to-orange-100 items-center justify-center">
                    <Crown className="w-8 h-8 text-orange-600 dark:text-orange-300" />
                  </div>
                }
                icon={<Crown className="h-4 w-4 text-neutral-500" />}
              >
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {specialRolesList.map(role => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.specialRoles.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ ...prev, specialRoles: [...prev.specialRoles, role.id] }))
                          } else {
                            setConfig(prev => ({ ...prev, specialRoles: prev.specialRoles.filter(r => r !== role.id) }))
                          }
                        }}
                        disabled={config.playerCount < role.minPlayers}
                        className="rounded"
                      />
                      <span className={config.playerCount < role.minPlayers ? 'text-gray-500' : 'text-white'}>
                        {role.name}
                      </span>
                    </label>
                  ))}
                </div>
              </BentoGridItem>

              {/* Add Players */}
              <BentoGridItem
                className="md:col-span-1"
                title={`Add Players (${gameState.players.length}/${config.playerCount})`}
                description="Enter player names"
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-200 dark:from-green-900 dark:to-green-800 to-green-100 items-center justify-center">
                    <Users className="w-8 h-8 text-green-600 dark:text-green-300" />
                  </div>
                }
                icon={<Users className="h-4 w-4 text-neutral-500" />}
              >
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                      placeholder="Player name"
                      className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/50"
                      maxLength={20}
                    />
                    <Button size="sm" onClick={addPlayer} disabled={gameState.players.length >= config.playerCount}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {gameState.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between text-sm bg-white/5 rounded p-1">
                        <span className="flex items-center gap-2">
                          <span>{player.avatar}</span>
                          <span>{player.name}</span>
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => removePlayer(player.id)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoGridItem>
            </BentoGrid>

            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={assignRolesAndWords}
                disabled={gameState.players.length < 3 || !config.wordPackId || gameState.players.length !== config.playerCount}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Game Lobby
  if (gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
              Game Ready!
            </h1>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Game Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-white space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{gameState.players.length}</div>
                    <div className="text-sm text-slate-300">Players</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{config.undercoverCount}</div>
                    <div className="text-sm text-slate-300">Undercover</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{config.mrWhiteCount}</div>
                    <div className="text-sm text-slate-300">Mr. White</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{gameState.players.length - config.undercoverCount - config.mrWhiteCount}</div>
                    <div className="text-sm text-slate-300">Civilians</div>
                  </div>
                </div>
                
                <div className="border-t border-white/20 pt-4">
                  <h3 className="font-semibold mb-2">Quick Rules:</h3>
                  <ul className="text-sm text-slate-300 space-y-1 text-left max-w-2xl mx-auto">
                    <li>• <strong className="text-cyan-400">Civilians:</strong> Find and eliminate all Undercover and Mr. White (+2 points)</li>
                    <li>• <strong className="text-red-400">Undercover:</strong> Survive to the end (+10 points)</li>
                    <li>• <strong className="text-purple-400">Mr. White:</strong> Survive OR guess the civilian word (+6 points, +4 bonus for guessing)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <AnimatedTooltip
              items={gameState.players.map((player, index) => ({
                id: index,
                name: player.name,
                designation: "Player",
                image: player.avatar
              }))}
            />

            <Button
              size="lg"
              onClick={startWordReveal}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 mt-8"
            >
              <Eye className="w-5 h-5 mr-2" />
              Start Word Reveal
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Word Reveal Phase
  if (gameState.phase === 'word-reveal') {
    const currentPlayer = gameState.players[currentRevealPlayer]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              Pass to {currentPlayer.name}
            </h1>
            <p className="text-slate-300 mb-8">
              {currentPlayer.name}, look at your word privately then pass the device
            </p>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
                <h2 className="text-2xl font-bold text-white mb-6">{currentPlayer.name}</h2>
                
                {!showWord ? (
                  <Button
                    size="lg"
                    onClick={() => setShowWord(true)}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Show My Word
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="text-4xl font-bold text-cyan-400 bg-white/10 rounded-xl p-6">
                      {currentPlayer.word || "NO WORD (You are Mr. White)"}
                    </div>
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowWord(false)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Word
                      </Button>
                      <Button
                        size="lg"
                        onClick={nextPlayerReveal}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 w-full"
                      >
                        {currentRevealPlayer < gameState.players.length - 1 ? 'Pass to Next Player' : 'Start Game'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="text-slate-400 text-sm">
              Player {currentRevealPlayer + 1} of {gameState.players.length}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Description Phase
  if (gameState.phase === 'description') {
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    const currentPlayer = alivePlayers[gameState.currentPlayerIndex]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Round {gameState.currentRound}</h1>
            <h2 className="text-xl text-slate-300 mb-8">Description Phase</h2>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{currentPlayer.name}'s Turn</h3>
                <p className="text-slate-300 mb-6">
                  Give a short, truthful description of your word. Speak aloud to all players.
                </p>
                
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Show word reminder
                      alert(currentPlayer.word || "You are Mr. White - you have no word!")
                    }}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Remind Me My Word
                  </Button>
                  <Button
                    size="lg"
                    onClick={nextDescription}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    Next Player
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Speaking Order */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {alivePlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border ${
                    index === gameState.currentPlayerIndex
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : index < gameState.currentPlayerIndex
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{player.avatar}</div>
                  <div className="text-sm text-white font-medium">{player.name}</div>
                  {index === gameState.currentPlayerIndex && (
                    <div className="text-xs text-cyan-400 mt-1">Speaking</div>
                  )}
                  {index < gameState.currentPlayerIndex && (
                    <div className="text-xs text-green-400 mt-1">Done</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Discussion Phase
  if (gameState.phase === 'discussion') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Discussion Phase</h1>
            <p className="text-slate-300 mb-8">
              Discuss the clues and decide who to eliminate
            </p>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-2xl font-bold text-white mb-4">Open Discussion</h3>
                <p className="text-slate-300 mb-6">
                  Talk about the clues you heard. Who seemed suspicious? 
                  Who gave clues that didn't quite fit?
                </p>
                
                {gameState.timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-xl font-bold text-cyan-400">
                      {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                
                <Button
                  size="lg"
                  onClick={startVoting}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Start Voting
                </Button>
              </CardContent>
            </Card>
            
            {/* Alive Players */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gameState.players.filter(p => !p.isEliminated).map(player => (
                <div key={player.id} className="p-3 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-2xl mb-1">{player.avatar}</div>
                  <div className="text-sm text-white font-medium">{player.name}</div>
                  <div className="text-xs text-green-400 mt-1">Alive</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Voting Phase
  if (gameState.phase === 'voting') {
    const alivePlayers = gameState.players.filter(p => !p.isEliminated)
    const votesNeeded = alivePlayers.length
    const votesCast = Object.keys(gameState.votes).length
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {gameState.isRevote ? 'Revote' : 'Voting Phase'}
            </h1>
            <p className="text-slate-300 mb-4">
              {gameState.isRevote ? 'There was a tie! Vote again.' : 'Vote to eliminate a player'}
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-xl font-bold text-red-400">
                  {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="text-slate-300">
                Votes: {votesCast}/{votesNeeded}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {alivePlayers.map(player => {
                const votesForPlayer = Object.values(gameState.votes).filter(vote => vote === player.id).length
                return (
                  <Card key={player.id} className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardContent className="p-4">
                      <div className="text-4xl mb-2">{player.avatar}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{player.name}</h3>
                      <div className="text-sm text-slate-300 mb-3">
                        Votes: {votesForPlayer}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // In a real implementation, you'd handle individual voting
                          // For now, we'll simulate group voting
                          const voterId = `voter-${Date.now()}`
                          castVote(voterId, player.id)
                        }}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                      >
                        Vote to Eliminate
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <Button
              size="lg"
              onClick={handleVotingComplete}
              disabled={votesCast === 0}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Voting
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Mr. White Guess Phase
  if (gameState.phase === 'mr-white-guess') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-4">Mr. White's Last Chance!</h1>
            <p className="text-slate-300 mb-8">
              {gameState.eliminatedThisRound?.name} was Mr. White! 
              They get one guess at the civilian word to win instantly.
            </p>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-6">Final Guess</h3>
                
                <input
                  type="text"
                  value={gameState.mrWhiteGuess}
                  onChange={(e) => setGameState(prev => ({ ...prev, mrWhiteGuess: e.target.value }))}
                  placeholder="Enter your guess for the civilian word"
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white text-lg placeholder-white/50 mb-6"
                  autoFocus
                />
                
                <Button
                  size="lg"
                  onClick={handleMrWhiteGuess}
                  disabled={!gameState.mrWhiteGuess.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Submit Guess
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Results Phase
  if (gameState.phase === 'results') {
    const finalScores = calculateFinalScores()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />
        <Meteors number={30} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Game Over!
            </h1>
            
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">
                  {gameState.gameWinner === 'civilians' ? '👥' : 
                   gameState.gameWinner === 'mrwhite' ? '🎯' : '🎭'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {gameState.gameWinner === 'civilians' ? 'Civilians Win!' :
                   gameState.gameWinner === 'mrwhite' ? 'Mr. White Wins!' : 'Impostors Win!'}
                </h2>
                <p className="text-slate-300">
                  {gameState.gameWinner === 'civilians' ? 'All impostors have been eliminated!' :
                   gameState.gameWinner === 'mrwhite' ? 'Mr. White guessed the civilian word correctly!' :
                   'The impostors have survived!'}
                </p>
              </CardContent>
            </Card>
            
            {/* Final Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {finalScores.map((player, index) => (
                <Card key={player.id} className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{player.avatar}</span>
                      {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{player.name}</h3>
                    <div className="text-sm text-slate-300 mb-2">
                      {player.role === 'civilian' ? '👥 Civilian' :
                       player.role === 'undercover' ? '🎭 Undercover' : '🎯 Mr. White'}
                    </div>
                    <div className="text-lg font-bold text-cyan-400">
                      +{player.roundScore} points
                    </div>
                    <div className="text-sm text-slate-400">
                      Total: {player.totalScore}
                    </div>
                    {player.isEliminated && (
                      <div className="text-xs text-red-400 mt-1">Eliminated</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Home
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}