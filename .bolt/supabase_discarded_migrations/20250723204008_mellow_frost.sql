/*
  # Change word_pack_id column type from UUID to TEXT

  1. Changes
    - Alter `word_pack_id` column in `local_game_configs` table from UUID to TEXT
    - This allows string identifiers like "general", "technology", etc.
    - Maintains foreign key relationship but allows non-UUID values

  2. Security
    - No changes to RLS policies needed
    - Existing data compatibility maintained
*/

-- Change the word_pack_id column from UUID to TEXT
ALTER TABLE local_game_configs 
ALTER COLUMN word_pack_id TYPE TEXT;