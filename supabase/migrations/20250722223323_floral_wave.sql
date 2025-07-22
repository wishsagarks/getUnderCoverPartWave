/*
  # Game Schema for Guess Who Now

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `room_code` (text, unique 6-digit code)
      - `host_id` (uuid, references auth.users)
      - `status` (enum: waiting, playing, finished)
      - `current_round` (integer)
      - `max_players` (integer)
      - `word_pack` (text)
      - `civilian_word` (text)
      - `undercover_word` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `players`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references rooms)
      - `user_id` (uuid, references auth.users)
      - `username` (text)
      - `role` (enum: civilian, undercover)
      - `is_alive` (boolean)
      - `has_given_clue` (boolean)
      - `clue` (text, nullable)
      - `joined_at` (timestamp)
    
    - `votes`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references rooms)
      - `voter_id` (uuid, references players)
      - `target_id` (uuid, references players)
      - `round` (integer)
      - `created_at` (timestamp)

    - `word_packs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (enum: curated, custom, ai)
      - `owner_id` (uuid, references auth.users)
      - `content` (jsonb)
      - `language` (text)
      - `difficulty` (text)
      - `is_public` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure players can only access their own game data
*/

-- Create custom types
CREATE TYPE room_status AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE player_role AS ENUM ('civilian', 'undercover');
CREATE TYPE word_pack_type AS ENUM ('curated', 'custom', 'ai');

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status room_status DEFAULT 'waiting',
  current_round integer DEFAULT 1,
  max_players integer DEFAULT 8,
  word_pack text DEFAULT 'general',
  civilian_word text,
  undercover_word text,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  role player_role DEFAULT 'civilian',
  is_alive boolean DEFAULT true,
  has_given_clue boolean DEFAULT false,
  clue text,
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES players(id) ON DELETE CASCADE,
  target_id uuid REFERENCES players(id) ON DELETE CASCADE,
  round integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, voter_id, round)
);

-- Create word_packs table
CREATE TABLE IF NOT EXISTS word_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type word_pack_type DEFAULT 'custom',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  language text DEFAULT 'en',
  difficulty text DEFAULT 'medium',
  is_public boolean DEFAULT false,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_score integer DEFAULT 0,
  reminders_used integer DEFAULT 0,
  favorite_role player_role,
  badges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can read rooms they're in"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their rooms"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

-- RLS Policies for players
CREATE POLICY "Users can read players in their rooms"
  ON players
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms as players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own player data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for votes
CREATE POLICY "Users can read votes in their rooms"
  ON votes
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can cast votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    voter_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for word_packs
CREATE POLICY "Users can read public word packs"
  ON word_packs
  FOR SELECT
  TO authenticated
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create word packs"
  ON word_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own word packs"
  ON word_packs
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for user_stats
CREATE POLICY "Users can read their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert default word packs
INSERT INTO word_packs (title, description, type, content, is_public, language) VALUES
('General Pack', 'Basic words for everyday gameplay', 'curated', 
 '{"pairs": [
   {"civilian": "Apple", "undercover": "Orange"},
   {"civilian": "Cat", "undercover": "Dog"},
   {"civilian": "Coffee", "undercover": "Tea"},
   {"civilian": "Summer", "undercover": "Winter"},
   {"civilian": "Book", "undercover": "Magazine"}
 ]}', true, 'en'),
('Indian Culture', 'Words related to Indian culture and traditions', 'curated',
 '{"pairs": [
   {"civilian": "Dosa", "undercover": "Idli"},
   {"civilian": "Bollywood", "undercover": "Hollywood"},
   {"civilian": "Cricket", "undercover": "Football"},
   {"civilian": "Holi", "undercover": "Diwali"},
   {"civilian": "Taj Mahal", "undercover": "Red Fort"}
 ]}', true, 'en'),
('Technology', 'Modern technology and gadgets', 'curated',
 '{"pairs": [
   {"civilian": "iPhone", "undercover": "Android"},
   {"civilian": "Netflix", "undercover": "YouTube"},
   {"civilian": "Instagram", "undercover": "TikTok"},
   {"civilian": "Tesla", "undercover": "BMW"},
   {"civilian": "Zoom", "undercover": "Teams"}
 ]}', true, 'en');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_word_packs_public ON word_packs(is_public);

-- Create function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM rooms WHERE room_code = code AND created_at > NOW() - INTERVAL '24 hours') INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create function to update room timestamp
CREATE OR REPLACE FUNCTION update_room_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room updates
CREATE TRIGGER update_rooms_timestamp
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_room_timestamp();