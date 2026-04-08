/*
  # Add Active Kitchen Location to Households

  1. Changes
    - Add `active_kitchen_location` column to `households` table
    - This allows users to designate which kitchen location is currently in use
    - Field is optional (nullable) to support households without kitchens set up yet
  
  2. Technical Details
    - Column type: text (matches the location field in household_appliances/household_implements)
    - Default value: NULL (no active kitchen until user selects one)
    - Index added for efficient queries when filtering by active location
  
  3. Notes
    - When a household has only one kitchen, the UI should automatically suggest it as active
    - When deleting a kitchen location, if it's the active one, active_kitchen_location should be cleared
    - This field will be used to filter recipes, suggest meals, and provide context-aware features
*/

-- Add active_kitchen_location column to households table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'households' AND column_name = 'active_kitchen_location'
  ) THEN
    ALTER TABLE households ADD COLUMN active_kitchen_location text;
  END IF;
END $$;

-- Add index for efficient queries on active kitchen location
CREATE INDEX IF NOT EXISTS idx_households_active_kitchen_location 
ON households(active_kitchen_location) 
WHERE active_kitchen_location IS NOT NULL;