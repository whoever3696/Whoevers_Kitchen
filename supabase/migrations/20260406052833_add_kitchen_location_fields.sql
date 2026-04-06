/*
  # Add Kitchen Location Support

  ## Overview
  Adds location field to household_appliances and household_implements tables to support
  multiple kitchen setups (main, camping, cabin, vacation, etc.) within a single household.

  ## Changes Made
    1. New Columns
      - `household_appliances.location` - Text field for kitchen location name (default: 'main')
      - `household_implements.location` - Text field for kitchen location name (default: 'main')
    
    2. Indexes
      - Added composite index on (household_id, location) for efficient queries
    
  ## Notes
    - Default location is 'main' for backward compatibility
    - Location names are case-insensitive (e.g., 'Main Kitchen', 'Camping', 'Cabin')
    - Users can have multiple locations per household
*/

-- Add location field to household_appliances
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_appliances' AND column_name = 'location'
  ) THEN
    ALTER TABLE household_appliances ADD COLUMN location text DEFAULT 'main' NOT NULL;
  END IF;
END $$;

-- Add location field to household_implements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_implements' AND column_name = 'location'
  ) THEN
    ALTER TABLE household_implements ADD COLUMN location text DEFAULT 'main' NOT NULL;
  END IF;
END $$;

-- Add indexes for efficient location queries
CREATE INDEX IF NOT EXISTS idx_household_appliances_location 
  ON household_appliances(household_id, location);

CREATE INDEX IF NOT EXISTS idx_household_implements_location 
  ON household_implements(household_id, location);