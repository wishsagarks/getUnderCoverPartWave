/*
  # Initial Schema Setup for Guess Who Now

  1. New Tables
    - `profiles` - User profiles linked to Supabase auth
    - `rooms` - Game rooms with status tracking
    - `players` - Player data and game state
    - `votes` - Voting system for eliminations
    - `word_packs` - Pre-loaded with curated packs
    - `user_stats` - Player statistics tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on user ownership
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code text UNIQUE NOT NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_round integer DEFAULT 1,
  max_players integer DEFAULT 8,
  word_pack text DEFAULT 'general',
  civilian_word text,
  undercover_word text,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Host can update room"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  role text DEFAULT 'civilian' CHECK (role IN ('civilian', 'undercover')),
  is_alive boolean DEFAULT true,
  has_given_clue boolean DEFAULT false,
  clue text,
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read room players"
  ON players
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p2 
      WHERE p2.room_id = players.room_id 
      AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  round integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, voter_id, round)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read room votes"
  ON votes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.room_id = votes.room_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can insert votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = votes.voter_id 
      AND p.user_id = auth.uid()
    )
  );

-- Word packs table
CREATE TABLE IF NOT EXISTS word_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  type text DEFAULT 'custom' CHECK (type IN ('curated', 'custom', 'community')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content jsonb NOT NULL,
  language text DEFAULT 'en',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_public boolean DEFAULT false,
  rating real DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public word packs"
  ON word_packs
  FOR SELECT
  TO authenticated
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create word packs"
  ON word_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own word packs"
  ON word_packs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_score integer DEFAULT 0,
  reminders_used integer DEFAULT 0,
  favorite_role text,
  badges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default word packs
INSERT INTO word_packs (title, description, type, content, is_public, language, difficulty) VALUES
(
  'General Pack',
  'Basic words for everyday gameplay',
  'curated',
  '{
    "pairs": [
      {"civilian": "Apple", "undercover": "Orange"},
      {"civilian": "Cat", "undercover": "Dog"},
      {"civilian": "Coffee", "undercover": "Tea"},
      {"civilian": "Summer", "undercover": "Winter"},
      {"civilian": "Book", "undercover": "Magazine"},
      {"civilian": "Car", "undercover": "Bike"},
      {"civilian": "Pizza", "undercover": "Burger"},
      {"civilian": "Ocean", "undercover": "Lake"}
    ]
  }',
  true,
  'en',
  'easy'
),
(
  'Indian Culture',
  'Words related to Indian culture and traditions',
  'curated',
  '{
    "pairs": [
      {"civilian": "Dosa", "undercover": "Idli"},
      {"civilian": "Bollywood", "undercover": "Hollywood"},
      {"civilian": "Cricket", "undercover": "Football"},
      {"civilian": "Holi", "undercover": "Diwali"},
      {"civilian": "Taj Mahal", "undercover": "Red Fort"},
      {"civilian": "Biryani", "undercover": "Pulao"},
      {"civilian": "Sari", "undercover": "Lehenga"}
    ]
  }',
  true,
  'en',
  'medium'
),
(
  'Technology',
  'Modern technology and gadgets',
  'curated',
  '{
    "pairs": [
      {"civilian": "iPhone", "undercover": "Android"},
      {"civilian": "Netflix", "undercover": "YouTube"},
      {"civilian": "Instagram", "undercover": "TikTok"},
      {"civilian": "Tesla", "undercover": "BMW"},
      {"civilian": "Zoom", "undercover": "Teams"},
      {"civilian": "WhatsApp", "undercover": "Telegram"},
      {"civilian": "Google", "undercover": "Bing"}
    ]
  }',
  true,
  'en',
  'medium'
);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := LPAD(floor(random() * 1000000)::text, 6, '0');
    SELECT EXISTS(
      SELECT 1 FROM rooms 
      WHERE room_code = code 
      AND created_at > now() - interval '24 hours'
    ) INTO exists;
    
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;