/*
  # Reset Database Schema for Guess Who Now Project
  
  This migration will:
  1. Drop all existing tables
  2. Create new schema optimized for Guess Who Now
  3. Insert default word packs
  4. Set up proper RLS policies
  5. Create necessary indexes and triggers
*/

-- Drop all existing tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS word_packs CASCADE;
DROP TABLE IF EXISTS local_game_configs CASCADE;
DROP TABLE IF EXISTS local_game_states CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS game_stats CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create word_packs table
CREATE TABLE word_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'curated' CHECK (type IN ('curated', 'custom', 'ai', 'community')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content jsonb NOT NULL,
  language text DEFAULT 'en',
  is_public boolean DEFAULT true,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating real DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create local_game_configs table
CREATE TABLE local_game_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_count integer NOT NULL CHECK (player_count >= 3 AND player_count <= 20),
  undercover_count integer NOT NULL CHECK (undercover_count >= 1),
  mrx_count integer NOT NULL CHECK (mrx_count >= 1),
  word_pack_id uuid REFERENCES word_packs(id) ON DELETE SET NULL,
  rounds integer NOT NULL DEFAULT 3 CHECK (rounds IN (3, 5, 7)),
  spectator_voting boolean DEFAULT false,
  minigames_enabled boolean DEFAULT true,
  observer_mode boolean DEFAULT true,
  discussion_timer boolean DEFAULT true,
  discussion_time_minutes integer DEFAULT 2 CHECK (discussion_time_minutes >= 1 AND discussion_time_minutes <= 10),
  animated_scoreboard boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create local_game_states table
CREATE TABLE local_game_states (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id uuid REFERENCES local_game_configs(id) ON DELETE CASCADE,
  players jsonb NOT NULL DEFAULT '[]',
  current_round integer DEFAULT 1,
  current_phase text DEFAULT 'setup' CHECK (current_phase IN ('setup', 'onboarding', 'role-reveal', 'clue-giving', 'discussion', 'voting', 'elimination', 'round-end', 'game-end')),
  current_player_index integer DEFAULT 0,
  speaking_order jsonb DEFAULT '[]',
  votes jsonb DEFAULT '{}',
  eliminated_players jsonb DEFAULT '[]',
  game_stats jsonb DEFAULT '{"totalClues": 0, "correctGuesses": 0, "mrXWins": 0, "civilianWins": 0}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table for online features
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_sessions table for online multiplayer
CREATE TABLE game_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_round integer DEFAULT 1,
  max_players integer DEFAULT 8,
  players jsonb DEFAULT '[]',
  game_state jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_stats table for player statistics
CREATE TABLE game_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_score integer DEFAULT 0,
  favorite_role text,
  best_streak integer DEFAULT 0,
  achievements jsonb DEFAULT '[]',
  badges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_word_packs_type ON word_packs(type);
CREATE INDEX idx_word_packs_difficulty ON word_packs(difficulty);
CREATE INDEX idx_word_packs_public ON word_packs(is_public);
CREATE INDEX idx_local_game_states_phase ON local_game_states(current_phase);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_room_code ON game_sessions(room_code);

-- Enable Row Level Security
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_packs
CREATE POLICY "Anyone can read public word packs" ON word_packs
  FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create word packs" ON word_packs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own word packs" ON word_packs
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for local games (allow anonymous access)
CREATE POLICY "Anyone can create local game configs" ON local_game_configs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read local game configs" ON local_game_configs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create local game states" ON local_game_states
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read local game states" ON local_game_states
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update local game states" ON local_game_states
  FOR UPDATE USING (true);

-- RLS Policies for user profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for game sessions
CREATE POLICY "Anyone can read game sessions" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update game sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = host_id);

-- RLS Policies for game stats
CREATE POLICY "Users can read own stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON game_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_word_packs_updated_at BEFORE UPDATE ON word_packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_game_states_updated_at BEFORE UPDATE ON local_game_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default word packs
INSERT INTO word_packs (title, description, type, difficulty, content, is_public) VALUES
(
  'General Pack',
  'Perfect for beginners - everyday words everyone knows',
  'curated',
  'easy',
  '{
    "pairs": [
      {"civilian": "Apple", "undercover": "Orange"},
      {"civilian": "Cat", "undercover": "Dog"},
      {"civilian": "Coffee", "undercover": "Tea"},
      {"civilian": "Summer", "undercover": "Winter"},
      {"civilian": "Book", "undercover": "Magazine"},
      {"civilian": "Car", "undercover": "Bike"},
      {"civilian": "Pizza", "undercover": "Burger"},
      {"civilian": "Ocean", "undercover": "Lake"},
      {"civilian": "Phone", "undercover": "Computer"},
      {"civilian": "Rain", "undercover": "Snow"},
      {"civilian": "Chair", "undercover": "Table"},
      {"civilian": "Pen", "undercover": "Pencil"},
      {"civilian": "Moon", "undercover": "Sun"},
      {"civilian": "Ice", "undercover": "Fire"},
      {"civilian": "Mountain", "undercover": "Hill"}
    ]
  }',
  true
),
(
  'Technology Pack',
  'Modern tech and digital world terms',
  'curated',
  'medium',
  '{
    "pairs": [
      {"civilian": "iPhone", "undercover": "Android"},
      {"civilian": "Netflix", "undercover": "YouTube"},
      {"civilian": "Instagram", "undercover": "TikTok"},
      {"civilian": "Tesla", "undercover": "BMW"},
      {"civilian": "Zoom", "undercover": "Teams"},
      {"civilian": "WhatsApp", "undercover": "Telegram"},
      {"civilian": "Google", "undercover": "Bing"},
      {"civilian": "Spotify", "undercover": "Apple Music"},
      {"civilian": "Amazon", "undercover": "eBay"},
      {"civilian": "Facebook", "undercover": "Twitter"},
      {"civilian": "PlayStation", "undercover": "Xbox"},
      {"civilian": "Chrome", "undercover": "Safari"},
      {"civilian": "Windows", "undercover": "Mac"},
      {"civilian": "Uber", "undercover": "Lyft"},
      {"civilian": "PayPal", "undercover": "Venmo"}
    ]
  }',
  true
),
(
  'Entertainment Pack',
  'Movies, music, and pop culture references',
  'curated',
  'medium',
  '{
    "pairs": [
      {"civilian": "Marvel", "undercover": "DC"},
      {"civilian": "Harry Potter", "undercover": "Lord of the Rings"},
      {"civilian": "Disney", "undercover": "Pixar"},
      {"civilian": "Batman", "undercover": "Superman"},
      {"civilian": "Star Wars", "undercover": "Star Trek"},
      {"civilian": "Netflix", "undercover": "Hulu"},
      {"civilian": "Avengers", "undercover": "Justice League"},
      {"civilian": "Titanic", "undercover": "Avatar"},
      {"civilian": "Game of Thrones", "undercover": "Breaking Bad"},
      {"civilian": "Friends", "undercover": "The Office"},
      {"civilian": "Minecraft", "undercover": "Fortnite"},
      {"civilian": "Pokemon", "undercover": "Digimon"},
      {"civilian": "Taylor Swift", "undercover": "Ariana Grande"},
      {"civilian": "McDonalds", "undercover": "Burger King"},
      {"civilian": "Coca Cola", "undercover": "Pepsi"}
    ]
  }',
  true
),
(
  'Advanced Pack',
  'Challenging words for experienced players',
  'curated',
  'hard',
  '{
    "pairs": [
      {"civilian": "Democracy", "undercover": "Republic"},
      {"civilian": "Philosophy", "undercover": "Psychology"},
      {"civilian": "Astronomy", "undercover": "Astrology"},
      {"civilian": "Architect", "undercover": "Engineer"},
      {"civilian": "Violin", "undercover": "Viola"},
      {"civilian": "Metaphor", "undercover": "Simile"},
      {"civilian": "Renaissance", "undercover": "Baroque"},
      {"civilian": "Capitalism", "undercover": "Socialism"},
      {"civilian": "Quantum", "undercover": "Nuclear"},
      {"civilian": "Ecosystem", "undercover": "Biosphere"},
      {"civilian": "Hypothesis", "undercover": "Theory"},
      {"civilian": "Entrepreneur", "undercover": "Executive"},
      {"civilian": "Meditation", "undercover": "Contemplation"},
      {"civilian": "Innovation", "undercover": "Invention"},
      {"civilian": "Sustainable", "undercover": "Renewable"}
    ]
  }',
  true
);