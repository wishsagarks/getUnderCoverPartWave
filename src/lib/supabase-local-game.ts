import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface LocalGameConfig {
  id: string
  playerCount: number
  undercoverCount: number
  mrXCount: number
  wordPackId: string
  rounds: number
  spectatorVoting: boolean
  minigamesEnabled: boolean
  observerMode: boolean
  discussionTimer: boolean
  animatedScoreboard: boolean
  createdAt: string
}

export interface LocalPlayer {
  id: string
  name: string
  avatar?: string
  role: 'civilian' | 'undercover' | 'mrx'
  word?: string
  isEliminated: boolean
  score: number
  cluesGiven: string[]
  votesReceived: number
  badges: string[]
}

export interface LocalGameState {
  id: string
  config: LocalGameConfig
  players: LocalPlayer[]
  currentRound: number
  currentPhase: 'setup' | 'onboarding' | 'role-reveal' | 'clue-giving' | 'discussion' | 'voting' | 'elimination' | 'round-end' | 'game-end'
  currentPlayerIndex: number
  speakingOrder: string[]
  votes: { [playerId: string]: string }
  eliminatedPlayers: LocalPlayer[]
  gameStats: {
    totalClues: number
    correctGuesses: number
    mrXWins: number
    civilianWins: number
  }
  createdAt: string
  updatedAt: string
}

export interface WordPack {
  id: string
  title: string
  description: string
  type: 'curated' | 'custom' | 'ai' | 'community'
  difficulty: 'easy' | 'medium' | 'hard'
  wordPairs: {
    civilian: string
    undercover: string
  }[]
  isPublic: boolean
  createdBy?: string
}

// Enhanced word packs with more variety
export const defaultWordPacks: WordPack[] = [
  {
    id: 'general',
    title: 'General Pack',
    description: 'Perfect for beginners - everyday words everyone knows',
    type: 'curated',
    difficulty: 'easy',
    isPublic: true,
    wordPairs: [
      { civilian: 'Apple', undercover: 'Orange' },
      { civilian: 'Cat', undercover: 'Dog' },
      { civilian: 'Coffee', undercover: 'Tea' },
      { civilian: 'Summer', undercover: 'Winter' },
      { civilian: 'Book', undercover: 'Magazine' },
      { civilian: 'Car', undercover: 'Bike' },
      { civilian: 'Pizza', undercover: 'Burger' },
      { civilian: 'Ocean', undercover: 'Lake' },
      { civilian: 'Phone', undercover: 'Computer' },
      { civilian: 'Rain', undercover: 'Snow' },
      { civilian: 'Chair', undercover: 'Table' },
      { civilian: 'Pen', undercover: 'Pencil' },
      { civilian: 'Moon', undercover: 'Sun' },
      { civilian: 'Ice', undercover: 'Fire' },
      { civilian: 'Mountain', undercover: 'Hill' }
    ]
  },
  {
    id: 'technology',
    title: 'Technology Pack',
    description: 'Modern tech and digital world terms',
    type: 'curated',
    difficulty: 'medium',
    isPublic: true,
    wordPairs: [
      { civilian: 'iPhone', undercover: 'Android' },
      { civilian: 'Netflix', undercover: 'YouTube' },
      { civilian: 'Instagram', undercover: 'TikTok' },
      { civilian: 'Tesla', undercover: 'BMW' },
      { civilian: 'Zoom', undercover: 'Teams' },
      { civilian: 'WhatsApp', undercover: 'Telegram' },
      { civilian: 'Google', undercover: 'Bing' },
      { civilian: 'Spotify', undercover: 'Apple Music' },
      { civilian: 'Amazon', undercover: 'eBay' },
      { civilian: 'Facebook', undercover: 'Twitter' },
      { civilian: 'PlayStation', undercover: 'Xbox' },
      { civilian: 'Chrome', undercover: 'Safari' },
      { civilian: 'Windows', undercover: 'Mac' },
      { civilian: 'Uber', undercover: 'Lyft' },
      { civilian: 'PayPal', undercover: 'Venmo' }
    ]
  },
  {
    id: 'entertainment',
    title: 'Entertainment Pack',
    description: 'Movies, music, and pop culture references',
    type: 'curated',
    difficulty: 'medium',
    isPublic: true,
    wordPairs: [
      { civilian: 'Marvel', undercover: 'DC' },
      { civilian: 'Harry Potter', undercover: 'Lord of the Rings' },
      { civilian: 'Disney', undercover: 'Pixar' },
      { civilian: 'Batman', undercover: 'Superman' },
      { civilian: 'Star Wars', undercover: 'Star Trek' },
      { civilian: 'Netflix', undercover: 'Hulu' },
      { civilian: 'Avengers', undercover: 'Justice League' },
      { civilian: 'Titanic', undercover: 'Avatar' },
      { civilian: 'Game of Thrones', undercover: 'Breaking Bad' },
      { civilian: 'Friends', undercover: 'The Office' },
      { civilian: 'Minecraft', undercover: 'Fortnite' },
      { civilian: 'Pokemon', undercover: 'Digimon' },
      { civilian: 'Taylor Swift', undercover: 'Ariana Grande' },
      { civilian: 'McDonald\'s', undercover: 'Burger King' },
      { civilian: 'Coca Cola', undercover: 'Pepsi' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Pack',
    description: 'Challenging words for experienced players',
    type: 'curated',
    difficulty: 'hard',
    isPublic: true,
    wordPairs: [
      { civilian: 'Democracy', undercover: 'Republic' },
      { civilian: 'Philosophy', undercover: 'Psychology' },
      { civilian: 'Astronomy', undercover: 'Astrology' },
      { civilian: 'Architect', undercover: 'Engineer' },
      { civilian: 'Violin', undercover: 'Viola' },
      { civilian: 'Metaphor', undercover: 'Simile' },
      { civilian: 'Renaissance', undercover: 'Baroque' },
      { civilian: 'Capitalism', undercover: 'Socialism' },
      { civilian: 'Quantum', undercover: 'Nuclear' },
      { civilian: 'Ecosystem', undercover: 'Biosphere' },
      { civilian: 'Hypothesis', undercover: 'Theory' },
      { civilian: 'Entrepreneur', undercover: 'Executive' },
      { civilian: 'Meditation', undercover: 'Contemplation' },
      { civilian: 'Innovation', undercover: 'Invention' },
      { civilian: 'Sustainable', undercover: 'Renewable' }
    ]
  }
]

// Save game configuration to Supabase
export const saveGameConfig = async (config: LocalGameConfig) => {
  const { data, error } = await supabase
    .from('local_game_configs')
    .insert(config)
    .select()
    .single()

  if (error) throw error
  return data
}

// Save game state to Supabase
export const saveGameState = async (gameState: LocalGameState) => {
  const { data, error } = await supabase
    .from('local_game_states')
    .upsert(gameState)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get word packs from Supabase (with fallback to default)
export const getWordPacks = async (): Promise<WordPack[]> => {
  try {
    const { data, error } = await supabase
      .from('word_packs')
      .select('*')
      .eq('is_public', true)

    if (error) throw error
    
    // Combine Supabase packs with default packs
    const supabasePacks = data?.map(pack => ({
      id: pack.id,
      title: pack.title,
      description: pack.description || '',
      type: pack.type as 'curated' | 'custom' | 'ai' | 'community',
      difficulty: pack.difficulty as 'easy' | 'medium' | 'hard',
      wordPairs: pack.content?.pairs || [],
      isPublic: pack.is_public,
      createdBy: pack.owner_id
    })) || []

    return [...defaultWordPacks, ...supabasePacks]
  } catch (error) {
    console.warn('Failed to fetch word packs from Supabase, using defaults:', error)
    return defaultWordPacks
  }
}

// Create new local game
export const createLocalGame = (config: LocalGameConfig): LocalGameState => {
  return {
    id: uuidv4(),
    config,
    players: [],
    currentRound: 1,
    currentPhase: 'setup',
    currentPlayerIndex: 0,
    speakingOrder: [],
    votes: {},
    eliminatedPlayers: [],
    gameStats: {
      totalClues: 0,
      correctGuesses: 0,
      mrXWins: 0,
      civilianWins: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Generate speaking order (Mr. X never first)
export const generateSpeakingOrder = (players: LocalPlayer[]): string[] => {
  const alivePlayers = players.filter(p => !p.isEliminated)
  const mrXPlayers = alivePlayers.filter(p => p.role === 'mrx')
  const otherPlayers = alivePlayers.filter(p => p.role !== 'mrx')
  
  // Shuffle other players
  const shuffledOthers = [...otherPlayers].sort(() => Math.random() - 0.5)
  
  // Insert Mr. X players randomly (but not first)
  const speakingOrder = [...shuffledOthers]
  mrXPlayers.forEach(mrX => {
    const insertIndex = Math.floor(Math.random() * (speakingOrder.length - 1)) + 1
    speakingOrder.splice(insertIndex, 0, mrX)
  })
  
  return speakingOrder.map(p => p.id)
}

// Assign roles and words
export const assignRolesAndWords = async (
  players: LocalPlayer[], 
  config: LocalGameConfig
): Promise<LocalPlayer[]> => {
  const wordPacks = await getWordPacks()
  const selectedPack = wordPacks.find(pack => pack.id === config.wordPackId) || wordPacks[0]
  const randomPair = selectedPack.wordPairs[Math.floor(Math.random() * selectedPack.wordPairs.length)]
  
  // Shuffle players for random role assignment
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
  
  // Assign Mr. X roles
  for (let i = 0; i < config.mrXCount; i++) {
    shuffledPlayers[i].role = 'mrx'
    shuffledPlayers[i].word = undefined // Mr. X has no word
  }
  
  // Assign Undercover roles
  for (let i = config.mrXCount; i < config.mrXCount + config.undercoverCount; i++) {
    shuffledPlayers[i].role = 'undercover'
    shuffledPlayers[i].word = randomPair.undercover
  }
  
  // Assign Civilian roles
  for (let i = config.mrXCount + config.undercoverCount; i < shuffledPlayers.length; i++) {
    shuffledPlayers[i].role = 'civilian'
    shuffledPlayers[i].word = randomPair.civilian
  }
  
  return shuffledPlayers
}

// Calculate elimination from votes
export const calculateElimination = (votes: { [playerId: string]: string }, players: LocalPlayer[]): LocalPlayer | null => {
  const voteCounts: { [playerId: string]: number } = {}
  
  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })
  
  if (Object.keys(voteCounts).length === 0) return null
  
  const maxVotes = Math.max(...Object.values(voteCounts))
  const eliminatedId = Object.keys(voteCounts).find(id => voteCounts[id] === maxVotes)
  
  return players.find(p => p.id === eliminatedId) || null
}

// Check win conditions
export const checkWinCondition = (players: LocalPlayer[]): 'mrx' | 'civilians' | 'undercover' | null => {
  const alivePlayers = players.filter(p => !p.isEliminated)
  const aliveMrX = alivePlayers.filter(p => p.role === 'mrx')
  const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian')
  const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover')
  
  // Mr. X wins if they survive to the end or guess the word correctly
  if (aliveMrX.length > 0 && (aliveCivilians.length + aliveUndercover.length) <= aliveMrX.length) {
    return 'mrx'
  }
  
  // Civilians win if all Mr. X and Undercover are eliminated
  if (aliveMrX.length === 0 && aliveUndercover.length === 0) {
    return 'civilians'
  }
  
  // Undercover wins if they outnumber civilians and Mr. X is eliminated
  if (aliveMrX.length === 0 && aliveUndercover.length >= aliveCivilians.length && aliveUndercover.length > 0) {
    return 'undercover'
  }
  
  return null
}

// Generate player avatars (emoji-based)
export const avatarOptions = [
  '🎭', '🎪', '🎨', '🎯', '🎲', '🎸', '🎺', '🎻', '🎤', '🎧',
  '🚀', '🌟', '⭐', '🌙', '☀️', '🌈', '🔥', '💎', '👑', '🏆',
  '🦄', '🐉', '🦋', '🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿'
]

// Generate random avatar
export const getRandomAvatar = (): string => {
  return avatarOptions[Math.floor(Math.random() * avatarOptions.length)]
}