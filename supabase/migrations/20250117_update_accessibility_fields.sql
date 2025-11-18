-- Update accessibility fields in fire_extinguishers table
-- Replace single text field with two specific Yes/No questions

-- Drop the old column
ALTER TABLE fire_extinguishers DROP COLUMN IF EXISTS accessibility_condition;

-- Add new columns
ALTER TABLE fire_extinguishers
  ADD COLUMN visibility_obstructed TEXT NOT NULL DEFAULT 'No' CHECK (visibility_obstructed IN ('Sí', 'No')),
  ADD COLUMN access_obstructed TEXT NOT NULL DEFAULT 'No' CHECK (access_obstructed IN ('Sí', 'No'));
