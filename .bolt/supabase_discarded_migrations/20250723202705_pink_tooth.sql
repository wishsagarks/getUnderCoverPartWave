/*
  # Insert Default Word Packs

  1. New Data
    - Insert default word packs into the word_packs table
    - Includes general, technology, entertainment, and advanced packs
    - Each pack has proper structure with word pairs in JSON format

  2. Data Structure
    - All packs are marked as public and curated
    - Word pairs stored in content.pairs array
    - Proper difficulty levels and descriptions
*/

-- Insert default word packs
INSERT INTO word_packs (id, title, description, type, content, language, difficulty, is_public, rating) VALUES
(
  'general',
  'General Pack',
  'Perfect for beginners - everyday words everyone knows',
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
  'en',
  'easy',
  true,
  4.5
),
(
  'technology',
  'Technology Pack',
  'Modern tech and digital world terms',
  'curated',
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
  'en',
  'medium',
  true,
  4.3
),
(
  'entertainment',
  'Entertainment Pack',
  'Movies, music, and pop culture references',
  'curated',
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
  'en',
  'medium',
  true,
  4.7
),
(
  'advanced',
  'Advanced Pack',
  'Challenging words for experienced players',
  'curated',
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
  'en',
  'hard',
  true,
  4.1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  content = EXCLUDED.content,
  language = EXCLUDED.language,
  difficulty = EXCLUDED.difficulty,
  is_public = EXCLUDED.is_public,
  rating = EXCLUDED.rating;