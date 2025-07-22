import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'game.db');
const db = new Database(dbPath);

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database schema initialization
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      host_id TEXT NOT NULL,
      status TEXT DEFAULT 'waiting',
      current_round INTEGER DEFAULT 1,
      max_players INTEGER DEFAULT 8,
      word_pack TEXT DEFAULT 'general',
      civilian_word TEXT,
      undercover_word TEXT,
      config TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id)
    )
  `);

  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT DEFAULT 'civilian',
      is_alive BOOLEAN DEFAULT 1,
      has_given_clue BOOLEAN DEFAULT 0,
      clue TEXT,
      score INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
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
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (voter_id) REFERENCES players(id),
      FOREIGN KEY (target_id) REFERENCES players(id),
      UNIQUE(room_id, voter_id, round)
    )
  `);

  // Word packs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_packs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'custom',
      owner_id TEXT,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      difficulty TEXT DEFAULT 'medium',
      is_public BOOLEAN DEFAULT 0,
      rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // User stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      reminders_used INTEGER DEFAULT 0,
      favorite_role TEXT,
      badges TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Insert default word packs
  const insertWordPack = db.prepare(`
    INSERT OR IGNORE INTO word_packs (id, title, description, type, content, is_public, language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultPacks = [
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
      language: 'en'
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
      language: 'en'
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
      language: 'en'
    }
  ];

  defaultPacks.forEach(pack => {
    insertWordPack.run(pack.id, pack.title, pack.description, pack.type, pack.content, pack.is_public, pack.language);
  });
}

// User authentication functions
export async function createUser(email: string, password: string, username: string) {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, username)
    VALUES (?, ?, ?, ?)
  `);
  
  try {
    stmt.run(id, email, passwordHash, username);
    
    // Create user stats
    const statsStmt = db.prepare(`
      INSERT INTO user_stats (id, user_id)
      VALUES (?, ?)
    `);
    statsStmt.run(uuidv4(), id);
    
    return { id, email, username };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function authenticateUser(email: string, password: string) {
  const stmt = db.prepare(`
    SELECT id, email, password_hash, username
    FROM users
    WHERE email = ?
  `);
  
  const user = stmt.get(email) as any;
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
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

// Room functions
export function generateRoomCode(): string {
  let code: string;
  let exists: boolean;
  
  do {
    code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const stmt = db.prepare('SELECT 1 FROM rooms WHERE room_code = ? AND created_at > datetime("now", "-24 hours")');
    exists = !!stmt.get(code);
  } while (exists);
  
  return code;
}

export function createRoom(hostId: string, maxPlayers: number = 8) {
  const id = uuidv4();
  const roomCode = generateRoomCode();
  
  const stmt = db.prepare(`
    INSERT INTO rooms (id, room_code, host_id, max_players)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(id, roomCode, hostId, maxPlayers);
  
  return { id, room_code: roomCode, host_id: hostId, status: 'waiting', max_players: maxPlayers };
}

export function joinRoom(roomCode: string, userId: string, username: string) {
  // Check if room exists and has space
  const roomStmt = db.prepare(`
    SELECT r.*, COUNT(p.id) as player_count
    FROM rooms r
    LEFT JOIN players p ON r.id = p.room_id
    WHERE r.room_code = ?
    GROUP BY r.id
  `);
  
  const room = roomStmt.get(roomCode) as any;
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.player_count >= room.max_players) {
    throw new Error('Room is full');
  }
  
  // Join the room
  const playerId = uuidv4();
  const playerStmt = db.prepare(`
    INSERT INTO players (id, room_id, user_id, username)
    VALUES (?, ?, ?, ?)
  `);
  
  try {
    playerStmt.run(playerId, room.id, userId, username);
    return { room, player: { id: playerId, room_id: room.id, user_id: userId, username } };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Already in this room');
    }
    throw error;
  }
}

export function getRoom(roomCode: string) {
  const stmt = db.prepare(`
    SELECT * FROM rooms WHERE room_code = ?
  `);
  return stmt.get(roomCode);
}

export function getRoomPlayers(roomId: string) {
  const stmt = db.prepare(`
    SELECT * FROM players WHERE room_id = ? ORDER BY joined_at
  `);
  return stmt.all(roomId);
}

export function getWordPacks() {
  const stmt = db.prepare(`
    SELECT * FROM word_packs WHERE is_public = 1 ORDER BY created_at DESC
  `);
  return stmt.all();
}

export function updatePlayerClue(playerId: string, clue: string) {
  const stmt = db.prepare(`
    UPDATE players 
    SET clue = ?, has_given_clue = 1
    WHERE id = ?
  `);
  return stmt.run(clue, playerId);
}

export function submitVote(roomId: string, voterId: string, targetId: string, round: number) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO votes (id, room_id, voter_id, target_id, round)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(id, roomId, voterId, targetId, round);
}

export function getVotes(roomId: string, round: number) {
  const stmt = db.prepare(`
    SELECT * FROM votes WHERE room_id = ? AND round = ?
  `);
  return stmt.all(roomId, round);
}

export function startGame(roomId: string, wordPack: any) {
  // Get alive players
  const playersStmt = db.prepare(`
    SELECT * FROM players WHERE room_id = ? AND is_alive = 1
  `);
  const players = playersStmt.all(roomId) as any[];
  
  // Assign roles randomly
  const undercoverCount = Math.max(1, Math.floor(players.length / 4));
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // Select random word pair
  const wordPairs = JSON.parse(wordPack.content).pairs;
  const selectedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  
  // Update room with words and status
  const roomStmt = db.prepare(`
    UPDATE rooms 
    SET status = 'playing', civilian_word = ?, undercover_word = ?
    WHERE id = ?
  `);
  roomStmt.run(selectedPair.civilian, selectedPair.undercover, roomId);
  
  // Assign roles to players
  const updatePlayerStmt = db.prepare(`
    UPDATE players SET role = ? WHERE id = ?
  `);
  
  for (let i = 0; i < players.length; i++) {
    const role = i < undercoverCount ? 'undercover' : 'civilian';
    updatePlayerStmt.run(role, shuffled[i].id);
  }
  
  return { success: true };
}

export function getUserStats(userId: string) {
  const stmt = db.prepare(`
    SELECT * FROM user_stats WHERE user_id = ?
  `);
  return stmt.get(userId);
}

// Initialize database on import
initializeDatabase();

export default db;