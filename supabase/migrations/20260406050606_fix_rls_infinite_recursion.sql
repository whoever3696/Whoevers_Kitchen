/*
  # Fix Infinite Recursion in RLS Policies

  ## Problem
  Multiple tables have RLS policies that query the household_members table.
  The household_members table's own policies also query household_members,
  creating an infinite recursion loop that prevents any queries from executing.

  ## Solution
  Create SECURITY DEFINER helper functions that bypass RLS when checking
  household membership. These functions execute with elevated privileges and
  don't trigger RLS policies, breaking the recursion chain.

  ## Changes

  ### 1. Helper Functions
  - `is_household_member(household_id, user_id)` - Checks if user is a household member
  - `is_household_admin(household_id, user_id)` - Checks if user is a household admin
  - Both use SECURITY DEFINER to bypass RLS

  ### 2. Updated Policies
  Replace all policies that directly query household_members with calls to the helper functions:
  - households table policies
  - household_members table policies
  - household_appliances table policies
  - household_implements table policies
  - household_ingredients table policies
  - meal_plans table policies
  - grocery_list table policies

  ## Security Notes
  - Helper functions are SECURITY DEFINER but only perform safe membership checks
  - No data modification is possible through these functions
  - Functions maintain the same security guarantees as original policies
  - All policies still enforce proper access control
*/

-- Create helper function to check if user is a household member
-- SECURITY DEFINER bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION is_household_member(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = p_household_id
    AND user_id = p_user_id
  );
$$;

-- Create helper function to check if user is a household admin
-- SECURITY DEFINER bypasses RLS to prevent recursion
CREATE OR REPLACE FUNCTION is_household_admin(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members
    WHERE household_id = p_household_id
    AND user_id = p_user_id
    AND role = 'admin'
  );
$$;

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Household members can view their household" ON households;
DROP POLICY IF EXISTS "Household admins can update household" ON households;
DROP POLICY IF EXISTS "Users can view household members of their household" ON household_members;
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;
DROP POLICY IF EXISTS "Household members can view their appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can add appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can update appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can delete appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can view their implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can add implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can update implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can delete implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can view their ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can add ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can update ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can delete ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can view their meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can view their grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can add to grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can update grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can delete from grocery list" ON grocery_list;

-- Recreate households policies using helper functions
CREATE POLICY "Household members can view their household"
  ON households FOR SELECT
  TO authenticated
  USING (is_household_member(id, auth.uid()));

CREATE POLICY "Household admins can update household"
  ON households FOR UPDATE
  TO authenticated
  USING (is_household_admin(id, auth.uid()))
  WITH CHECK (is_household_admin(id, auth.uid()));

-- Recreate household_members policies using helper functions
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_household_member(household_id, auth.uid())
  );

CREATE POLICY "Admins can manage household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (is_household_admin(household_id, auth.uid()));

-- Recreate household_appliances policies using helper functions
CREATE POLICY "Household members can view their appliances"
  ON household_appliances FOR SELECT
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can add appliances"
  ON household_appliances FOR INSERT
  TO authenticated
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can update appliances"
  ON household_appliances FOR UPDATE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()))
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can delete appliances"
  ON household_appliances FOR DELETE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

-- Recreate household_implements policies using helper functions
CREATE POLICY "Household members can view their implements"
  ON household_implements FOR SELECT
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can add implements"
  ON household_implements FOR INSERT
  TO authenticated
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can update implements"
  ON household_implements FOR UPDATE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()))
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can delete implements"
  ON household_implements FOR DELETE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

-- Recreate household_ingredients policies using helper functions
CREATE POLICY "Household members can view their ingredients"
  ON household_ingredients FOR SELECT
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can add ingredients"
  ON household_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can update ingredients"
  ON household_ingredients FOR UPDATE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()))
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can delete ingredients"
  ON household_ingredients FOR DELETE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

-- Recreate meal_plans policies using helper functions
CREATE POLICY "Household members can view their meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()))
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

-- Recreate grocery_list policies using helper functions
CREATE POLICY "Household members can view their grocery list"
  ON grocery_list FOR SELECT
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can add to grocery list"
  ON grocery_list FOR INSERT
  TO authenticated
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can update grocery list"
  ON grocery_list FOR UPDATE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()))
  WITH CHECK (is_household_member(household_id, auth.uid()));

CREATE POLICY "Household members can delete from grocery list"
  ON grocery_list FOR DELETE
  TO authenticated
  USING (is_household_member(household_id, auth.uid()));
