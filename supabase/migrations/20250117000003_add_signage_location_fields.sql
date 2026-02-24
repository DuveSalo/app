-- Add signage location fields to fire_extinguishers table
-- Add three new fields for signage location tracking

ALTER TABLE fire_extinguishers
  ADD COLUMN signage_floor TEXT NOT NULL DEFAULT 'N/A' CHECK (signage_floor IN ('Sí', 'No', 'N/A')),
  ADD COLUMN signage_wall TEXT NOT NULL DEFAULT 'N/A' CHECK (signage_wall IN ('Sí', 'No', 'N/A')),
  ADD COLUMN signage_height TEXT NOT NULL DEFAULT 'N/A' CHECK (signage_height IN ('Sí', 'No', 'N/A'));
