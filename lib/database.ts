import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      reminders_used INTEGER DEFAULT 0,
      favorite_role TEXT,
      badges TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `);

  // Rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      host_id TEXT NOT NULL,
      status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
      current_round INTEGER DEFAULT 1,
      max_players INTEGER DEFAULT 8,
      word_pack TEXT DEFAULT 'general',
      civilian_word TEXT,
      undercover_word TEXT,
      config TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT DEFAULT 'civilian' CHECK (role IN ('civilian', 'undercover')),
      is_alive INTEGER DEFAULT 1,
      has_given_clue INTEGER DEFAULT 0,
      clue TEXT,
      score INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(room_id, user_id)
    )
  `);

  // Votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      round INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (voter_id) REFERENCES players(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES players(id) ON DELETE CASCADE,
      UNIQUE(room_id, voter_id, round)
    )
  `);

  // Word packs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_packs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'custom' CHECK (type IN ('curated', 'custom', 'community')),
      owner_id TEXT,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
      is_public INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Insert default word packs
  const insertWordPack = db.prepare(`
    INSERT OR IGNORE INTO word_packs (id, title, description, type, content, is_public, language, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const wordPacks = [
    {
      id: 'general-pack',
      title: 'General Pack',
      description: 'Basic words for everyday gameplay',
      type: 'curated',
      content: JSON.stringify({
        pairs: [
          { civilian: 'Apple', undercover: 'Orange' },
          { civilian: 'Cat', undercover: 'Dog' },
          { civilian: 'Coffee', undercover: 'Tea' },
          { civilian: 'Summer', undercover: 'Winter' },
          { civilian: 'Book', undercover: 'Magazine' },
          { civilian: 'Car', undercover: 'Bike' },
          { civilian: 'Pizza', undercover: 'Burger' },
          { civilian: 'Ocean', undercover: 'Lake' }
        ]
      }),
      is_public: 1,
      language: 'en',
      difficulty: 'easy'
    },
    {
      id: 'indian-culture',
      title: 'Indian Culture',
      description: 'Words related to Indian culture and traditions',
      type: 'curated',
      content: JSON.stringify({
        pairs: [
          { civilian: 'Dosa', undercover: 'Idli' },
          { civilian: 'Bollywood', undercover: 'Hollywood' },
          { civilian: 'Cricket', undercover: 'Football' },
          { civilian: 'Holi', undercover: 'Diwali' },
          { civilian: 'Taj Mahal', undercover: 'Red Fort' },
          { civilian: 'Biryani', undercover: 'Pulao' },
          { civilian: 'Sari', undercover: 'Lehenga' }
        ]
      }),
      is_public: 1,
      language: 'en',
      difficulty: 'medium'
    },
    {
      id: 'technology',
      title: 'Technology',
      description: 'Modern technology and gadgets',
      type: 'curated',
      content: JSON.stringify({
        pairs: [
          { civilian: 'iPhone', undercover: 'Android' },
          { civilian: 'Netflix', undercover: 'YouTube' },
          { civilian: 'Instagram', undercover: 'TikTok' },
          { civilian: 'Tesla', undercover: 'BMW' },
          { civilian: 'Zoom', undercover: 'Teams' },
          { civilian: 'WhatsApp', undercover: 'Telegram' },
          { civilian: 'Google', undercover: 'Bing' }
        ]
      }),
      is_public: 1,
      language: 'en',
      difficulty: 'medium'
    }
  ];

  wordPacks.forEach(pack => {
    insertWordPack.run(
      pack.id,
      pack.title,
      pack.description,
      pack.type,
      pack.content,
      pack.is_public,
      pack.language,
      pack.difficulty
    );
  });
}

// User management functions
export function createUser(email: string, password: string, username: string) {
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, username)
    VALUES (?, ?, ?, ?)
  `);
  
  const insertStats = db.prepare(`
    INSERT INTO user_stats (id, user_id)
    VALUES (?, ?)
  `);
  
  try {
    insertUser.run(id, email, passwordHash, username);
    insertStats.run(uuidv4(), id);
    
    return { id, email, username };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export function authenticateUser(email: string, password: string) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
    user: { id: user.id, email: user.email, username: user.username },
    token
  };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// Room management functions
export function generateRoomCode(): string {
  let code: string;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (db.prepare('SELECT 1 FROM rooms WHERE room_code = ? AND created_at > datetime("now", "-24 hours")').get(code));
  
  return code;
}

export function createRoom(hostId: string, maxPlayers: number = 8) {
  const id = uuidv4();
  const roomCode = generateRoomCode();
  
  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, room_code, host_id, max_players)
    VALUES (?, ?, ?, ?)
  `);
  
  insertRoom.run(id, roomCode, hostId, maxPlayers);
  
  return { id, room_code: roomCode, host_id: hostId, max_players: maxPlayers };
}

export function getRoomByCode(roomCode: string) {
  return db.prepare('SELECT * FROM rooms WHERE room_code = ?').get(roomCode) as any;
}

export function joinRoom(roomId: string, userId: string, username: string) {
  const playerId = uuidv4();
  
  const insertPlayer = db.prepare(`
    INSERT INTO players (id, room_id, user_id, username)
    VALUES (?, ?, ?, ?)
  `);
  
  insertPlayer.run(playerId, roomId, userId, username);
  
  return { id: playerId, room_id: roomId, user_id: userId, username };
}

export function getPlayersInRoom(roomId: string) {
  return db.prepare('SELECT * FROM players WHERE room_id = ? ORDER BY joined_at').all(roomId) as any[];
}

export function getVotesInRoom(roomId: string, round: number) {
  return db.prepare('SELECT * FROM votes WHERE room_id = ? AND round = ?').all(roomId, round) as any[];
}

export function updatePlayerClue(playerId: string, clue: string) {
  const updatePlayer = db.prepare(`
    UPDATE players 
    SET clue = ?, has_given_clue = 1 
    WHERE id = ?
  `);
  
  updatePlayer.run(clue, playerId);
}

export function submitVote(roomId: string, voterId: string, targetId: string, round: number) {
  const voteId = uuidv4();
  
  const insertVote = db.prepare(`
    INSERT INTO votes (id, room_id, voter_id, target_id, round)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertVote.run(voteId, roomId, voterId, targetId, round);
}

export function startGame(roomId: string, wordPack: any) {
  const players = getPlayersInRoom(roomId);
  const alivePlayers = players.filter(p => p.is_alive);
  const undercoverCount = Math.max(1, Math.floor(alivePlayers.length / 4));
  
  // Select random word pair
  const wordPairs = JSON.parse(wordPack.content).pairs;
  const selectedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  
  // Update room with words and status
  const updateRoom = db.prepare(`
    UPDATE rooms 
    SET status = 'playing', civilian_word = ?, undercover_word = ?
    WHERE id = ?
  `);
  
  updateRoom.run(selectedPair.civilian, selectedPair.undercover, roomId);
  
  // Assign roles to players
  const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
  const updatePlayer = db.prepare('UPDATE players SET role = ? WHERE id = ?');
  
  for (let i = 0; i < alivePlayers.length; i++) {
    const role = i < undercoverCount ? 'undercover' : 'civilian';
    updatePlayer.run(role, shuffled[i].id);
  }
  
  return { success: true };
}

export function getWordPacks() {
  return db.prepare('SELECT * FROM word_packs WHERE is_public = 1 ORDER BY created_at DESC').all() as any[];
}

// Initialize database on import
initializeDatabase();