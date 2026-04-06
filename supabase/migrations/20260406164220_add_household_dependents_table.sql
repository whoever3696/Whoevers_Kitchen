/*
  # Add Household Dependents Table
  
  This migration adds support for manually adding household members who don't have accounts,
  such as children or partners who don't need individual login access.

  1. New Tables
    - `household_dependents`
      - `id` (uuid, primary key) - Unique identifier for the dependent
      - `household_id` (uuid, foreign key) - References the household
      - `name` (text) - Display name of the dependent
      - `age_group` (text, optional) - Age category: 'child', 'teen', or 'adult'
      - `dietary_restrictions` (text, optional) - Any dietary notes or restrictions
      - `added_by` (uuid, foreign key) - User who added this dependent
      - `created_at` (timestamptz) - When the dependent was added
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `household_dependents` table
    - Add policy for household members to view dependents
    - Add policy for household admins to manage dependents
    - Restrict creation to authenticated users who are members of the household

  3. Indexes
    - Add index on household_id for efficient lookups
*/

-- Create household_dependents table
CREATE TABLE IF NOT EXISTS household_dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  age_group text CHECK (age_group IN ('child', 'teen', 'adult')),
  dietary_restrictions text,
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for efficient household lookups
CREATE INDEX IF NOT EXISTS idx_household_dependents_household_id 
  ON household_dependents(household_id);

-- Enable RLS
ALTER TABLE household_dependents ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view all dependents in their household
CREATE POLICY "Household members can view dependents"
  ON household_dependents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_dependents.household_id
      AND household_members.user_id = auth.uid()
    )
  );

-- Policy: Household admins can insert dependents
CREATE POLICY "Household admins can add dependents"
  ON household_dependents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_dependents.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
    AND added_by = auth.uid()
  );

-- Policy: Household admins can update dependents
CREATE POLICY "Household admins can update dependents"
  ON household_dependents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_dependents.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_dependents.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Policy: Household admins can delete dependents
CREATE POLICY "Household admins can delete dependents"
  ON household_dependents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_dependents.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_household_dependents_updated_at ON household_dependents;
CREATE TRIGGER update_household_dependents_updated_at
  BEFORE UPDATE ON household_dependents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();