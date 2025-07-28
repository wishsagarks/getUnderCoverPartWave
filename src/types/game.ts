// src/types/game.ts

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role: 'civilian' | 'undercover' | 'mrx';
  word: string;
  isEliminated: boolean;
  score: number;
  cluesGiven: string[];
}

export interface WordPair {
  civilian: string;
  undercover: string;
}

export interface WordPack {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordPairs: WordPair[];
  type: string;
  language: string;
  is_public: boolean;
  owner_id: string | null;
  rating: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface GameConfig {
  playerCount: number;
  undercoverCount: number;
  mrXCount: number;
  wordPackId: string;
  rounds: number;
  spectatorVoting: boolean;
  minigamesEnabled: boolean;
  observerMode: boolean;
  discussionTimer: boolean;
  discussionTimeMinutes: number;
  animatedScoreboard: boolean;
}
