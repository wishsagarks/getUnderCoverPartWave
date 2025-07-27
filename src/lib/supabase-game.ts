import { supabase } from './supabase'

export interface GameRoom {
  id: string
  room_code: string
  host_id: string
  status: 'waiting' | 'playing' | 'finished'
  current_round: number
  max_players: number
  word_pack: string
  civilian_word: string | null
  undercover_word: string | null
  config: any
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  room_id: string
  user_id: string
  username: string
  role: 'civilian' | 'undercover'
  is_alive: boolean
  has_given_clue: boolean
  clue: string | null
  score: number
  joined_at: string
}

export interface Vote {
  id: string
  room_id: string
  voter_id: string
  target_id: string
  round: number
  created_at: string
}

// Word packs for the game
export const wordPacks = [
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

// Generate random room code
export const generateRoomCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create a new game room
export const createRoom = async (hostId: string, config: any = {}) => {
  const roomCode = generateRoomCode()
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      host_id: hostId,
      status: 'waiting',
      max_players: config.maxPlayers || 8,
      word_pack: config.wordPack || 'general',
      config: config
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Join a room
export const joinRoom = async (roomCode: string, userId: string, username: string) => {
  // First check if room exists and has space
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, players(*)')
    .eq('room_code', roomCode)
    .single()

  if (roomError) throw new Error('Room not found')
  if (room.status !== 'waiting') throw new Error('Game already started')
  if (room.players.length >= room.max_players) throw new Error('Room is full')

  // Check if user already in room
  const existingPlayer = room.players.find((p: any) => p.user_id === userId)
  if (existingPlayer) return existingPlayer

  // Add player to room
  const { data, error } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: userId,
      username: username,
      role: 'civilian',
      is_alive: true,
      has_given_clue: false,
      score: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Start game - assign roles and words
export const startGame = async (roomId: string) => {
  // Get room and players
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, players(*)')
    .eq('id', roomId)
    .single()

  if (roomError) throw roomError
  if (room.players.length < 3) throw new Error('Need at least 3 players')

  // Select word pair
  const selectedPack = wordPacks.find(pack => pack.id === room.word_pack)!
  const randomPair = selectedPack.pairs[Math.floor(Math.random() * selectedPack.pairs.length)]

  // Assign undercover role to one random player
  const players = [...room.players]
  const undercoverIndex = Math.floor(Math.random() * players.length)
  
  // Update players with roles
  for (let i = 0; i < players.length; i++) {
    const role = i === undercoverIndex ? 'undercover' : 'civilian'
    await supabase
      .from('players')
      .update({ role })
      .eq('id', players[i].id)
  }

  // Update room with words and status
  const { data, error } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      civilian_word: randomPair.civilian,
      undercover_word: randomPair.undercover,
      current_round: 1
    })
    .eq('id', roomId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Submit clue
export const submitClue = async (playerId: string, clue: string) => {
  const { data, error } = await supabase
    .from('players')
    .update({
      clue: clue,
      has_given_clue: true
    })
    .eq('id', playerId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Submit vote
export const submitVote = async (roomId: string, voterId: string, targetId: string, round: number) => {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      room_id: roomId,
      voter_id: voterId,
      target_id: targetId,
      round: round
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get room with players
export const getRoomWithPlayers = async (roomCode: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      players(*),
      votes(*)
    `)
    .eq('room_code', roomCode)
    .single()

  if (error) throw error
  return data
}

// Real-time subscriptions
export const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
      callback
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe()
}

// Calculate elimination from votes
export const calculateElimination = (votes: Vote[], players: Player[]) => {
  const voteCounts: { [playerId: string]: number } = {}
  
  votes.forEach(vote => {
    voteCounts[vote.target_id] = (voteCounts[vote.target_id] || 0) + 1
  })

  const maxVotes = Math.max(...Object.values(voteCounts))
  const eliminatedId = Object.keys(voteCounts).find(id => voteCounts[id] === maxVotes)
  
  return players.find(p => p.id === eliminatedId)
}

// Check win conditions
export const checkWinCondition = (players: Player[]) => {
  const alivePlayers = players.filter(p => p.is_alive)
  const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian')
  const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover')

  if (aliveUndercover.length === 0) {
    return 'civilians'
  } else if (aliveCivilians.length <= aliveUndercover.length) {
    return 'undercover'
  }
  
  return null
}