/*
  # Add missing animatedScoreboard column

  1. Changes
    - Add `animated_scoreboard` column to `local_game_configs` table
    - Set default value to `true` to match application expectations
    - Make column nullable for backward compatibility

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'local_game_configs' AND column_name = 'animated_scoreboard'
  ) THEN
    ALTER TABLE local_game_configs ADD COLUMN animated_scoreboard boolean DEFAULT true;
  END IF;
END $$;