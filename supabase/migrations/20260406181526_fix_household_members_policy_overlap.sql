/*
  # Fix Multiple Permissive Policies on household_members

  1. Issue
    - "Admins can manage household members" uses FOR ALL which creates policies for every operation
    - This overlaps with "Users can join households" (INSERT) and "Users can view household members" (SELECT)
    - Multiple permissive policies for the same action can cause confusion
  
  2. Solution
    - Split the admin policy into separate UPDATE and DELETE policies
    - Keep the existing INSERT and SELECT policies for regular users
    - Admins can still do everything, but policies are now properly separated
*/

-- Drop the overlapping FOR ALL policy
DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;

-- Create separate admin policies for UPDATE and DELETE only
CREATE POLICY "Admins can update household members"
  ON household_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role = 'admin'
    )
  );

-- Note: The existing policies handle the rest:
-- - "Users can join households" handles INSERT for regular users
-- - "Users can view household members" handles SELECT for all members
-- - Admins need a separate INSERT policy to add other users

CREATE POLICY "Admins can add household members"
  ON household_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = (select auth.uid())
      AND hm.role = 'admin'
    )
  );
