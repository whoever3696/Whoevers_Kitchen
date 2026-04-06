/*
  # Consolidate Meal Ratings Policies

  1. Performance Improvements
    - Combine multiple permissive SELECT policies into a single policy
    - This reduces the number of policy evaluations per query
  
  2. Changes
    - Remove "Users can view own ratings" policy
    - Remove "Household members can view household ratings" policy
    - Create single "Users can view ratings" policy that handles both cases
*/

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own ratings" ON meal_ratings;
DROP POLICY IF EXISTS "Household members can view household ratings" ON meal_ratings;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view ratings"
  ON meal_ratings FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM household_members hm1
      WHERE hm1.user_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM household_members hm2
        WHERE hm2.user_id = meal_ratings.user_id
        AND hm2.household_id = hm1.household_id
      )
    )
  );
