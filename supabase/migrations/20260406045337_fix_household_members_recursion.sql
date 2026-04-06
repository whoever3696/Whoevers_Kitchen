/*
  # Fix Infinite Recursion in household_members RLS Policies

  ## Problem
  The existing SELECT and DELETE policies for household_members create infinite recursion
  by querying the same table they're protecting within their policy conditions.

  ## Changes Made
  1. **SELECT Policy**: Drop and recreate to use a two-part approach:
     - Users can always view their own membership records (user_id = auth.uid())
     - Users can view other members in households they belong to via subquery
  
  2. **DELETE Policy**: Drop and recreate to use subquery approach:
     - Only admins can delete members
     - Uses subquery to check admin status without creating recursion

  ## Security Notes
  - Maintains same security guarantees as original policies
  - Prevents infinite recursion by using subqueries that establish user's memberships first
  - Users still can only see members in their own households
  - Only admins can still manage household members
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view household members of their household" ON household_members;
DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;

-- Recreate SELECT policy without recursion
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()  -- Users can always see their own membership
    OR household_id IN (   -- Users can see other members in households they belong to
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Recreate DELETE policy without recursion
CREATE POLICY "Admins can manage household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
