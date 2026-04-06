/*
  # Fix households SELECT Policy to Allow Creators

  ## Problem
  When creating a household with `.insert().select()`, the SELECT policy
  blocks the returned row because the user is not yet a household member.
  This causes household creation to fail with an RLS error.

  ## Solution
  Update the SELECT policy to allow users to view households they created,
  even before they're added as members.

  ## Changes
  - Drop and recreate the SELECT policy for households
  - Allow viewing if user is a member OR if user created the household

  ## Security Notes
  - Users can only see households they belong to or created
  - This enables the INSERT...SELECT pattern to work correctly
  - Once the creator is added as a member, the membership check takes over
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Household members can view their household" ON households;

-- Recreate with additional check for creators
CREATE POLICY "Users can view households they created or belong to"
  ON households FOR SELECT
  TO authenticated
  USING (
    is_household_member(id, auth.uid()) OR
    created_by = auth.uid()
  );
