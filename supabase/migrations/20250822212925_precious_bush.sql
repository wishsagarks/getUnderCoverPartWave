/*
  # Create Word Packs Table

  1. New Tables
    - `word_packs`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `type` (text, default 'curated') - curated, custom, ai, community
      - `difficulty` (text, default 'medium') - easy, medium, hard
      - `content` (jsonb, not null) - stores word pairs
      - `language` (text, default 'en')
      - `is_public` (boolean, default true)
      - `owner_id` (uuid, nullable) - references auth.users
      - `rating` (real, default 0)
      - `usage_count` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `word_packs` table
    - Add policies for public read access
    - Add policies for authenticated users to create/update their own packs

  3. Indexes
    - Index on type for filtering
    - Index on is_public for public packs
*/

-- Create word_packs table
CREATE TABLE IF NOT EXISTS word_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text DEFAULT 'curated' CHECK (type IN ('curated', 'custom', 'ai', 'community')),
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content jsonb NOT NULL,
  language text DEFAULT 'en',
  is_public boolean DEFAULT true,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating real DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public word packs are readable by everyone"
  ON word_packs
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can read their own private word packs"
  ON word_packs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create word packs"
  ON word_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own word packs"
  ON word_packs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own word packs"
  ON word_packs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_word_packs_type ON word_packs(type);
CREATE INDEX IF NOT EXISTS idx_word_packs_public ON word_packs(is_public);
CREATE INDEX IF NOT EXISTS idx_word_packs_difficulty ON word_packs(difficulty);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_word_packs_updated_at
    BEFORE UPDATE ON word_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
      {"civilian": "McDonald''s", "undercover": "Burger King"},
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
),
(
  'AI Pack (Coming Soon)',
  'AI-generated word pairs using Gemini API',
  'ai',
  'medium',
  '{
    "pairs": [
      {"civilian": "Coming", "undercover": "Soon"}
    ]
  }',
  false
);