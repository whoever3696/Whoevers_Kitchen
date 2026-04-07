/*
  # Fix Infinite Recursion in household_members Policies

  ## Problem
  The household_members RLS policies query the household_members table itself,
  creating infinite recursion:
  - "Users can view household members" checks household_members to see if user is a member
  - All admin policies check household_members to see if user is an admin
  - These queries trigger the same policies again, causing infinite loops

  ## Solution
  Create a SECURITY DEFINER function that bypasses RLS to check membership,
  then use this function in the policies instead of direct queries.

  ## Changes
  1. Drop existing helper functions if they exist
  2. Drop all existing household_members policies
  3. Create helper function: is_household_member(household_id, user_id)
  4. Create helper function: is_household_admin(household_id, user_id)
  5. Recreate policies using these helper functions
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS is_household_member(uuid, uuid);
DROP FUNCTION IF EXISTS is_household_admin(uuid, uuid);

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can join households" ON household_members;
DROP POLICY IF EXISTS "Admins can add household members" ON household_members;
DROP POLICY IF EXISTS "Admins can update household members" ON household_members;
DROP POLICY IF EXISTS "Admins can delete household members" ON household_members;

-- Create helper function to check if user is a member (bypasses RLS)
CREATE OR REPLACE FUNCTION is_household_member(household_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM household_members
    WHERE household_id = household_id_param
    AND user_id = user_id_param
  );
$$;

-- Create helper function to check if user is an admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_household_admin(household_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM household_members
    WHERE household_id = household_id_param
    AND user_id = user_id_param
    AND role = 'admin'
  );
$$;

-- Recreate policies using helper functions (no more recursion!)

-- SELECT: Members can view all members in their household
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  TO authenticated
  USING (
    is_household_member(household_id, auth.uid())
  );

-- INSERT: Users can add themselves to a household
CREATE POLICY "Users can join households"
  ON household_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- INSERT: Admins can add other users to their household
CREATE POLICY "Admins can add household members"
  ON household_members FOR INSERT
  TO authenticated
  WITH CHECK (
    is_household_admin(household_id, auth.uid())
  );

-- UPDATE: Admins can update member roles
CREATE POLICY "Admins can update household members"
  ON household_members FOR UPDATE
  TO authenticated
  USING (
    is_household_admin(household_id, auth.uid())
  )
  WITH CHECK (
    is_household_admin(household_id, auth.uid())
  );

-- DELETE: Admins can remove members
CREATE POLICY "Admins can delete household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (
    is_household_admin(household_id, auth.uid())
  );
