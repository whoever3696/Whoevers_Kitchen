/*
  # Optimize All RLS Policies for Performance

  1. Performance Improvements
    - Replace all `auth.uid()` calls with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale
  
  2. All Tables with RLS Policies Updated
*/

-- user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);

-- dietary_goals
DROP POLICY IF EXISTS "Users can view own dietary goals" ON dietary_goals;
DROP POLICY IF EXISTS "Users can create own dietary goals" ON dietary_goals;
DROP POLICY IF EXISTS "Users can update own dietary goals" ON dietary_goals;
DROP POLICY IF EXISTS "Users can delete own dietary goals" ON dietary_goals;

CREATE POLICY "Users can view own dietary goals" ON dietary_goals FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create own dietary goals" ON dietary_goals FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own dietary goals" ON dietary_goals FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own dietary goals" ON dietary_goals FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- weekly_preferences
DROP POLICY IF EXISTS "Users can view own weekly preferences" ON weekly_preferences;
DROP POLICY IF EXISTS "Users can create own weekly preferences" ON weekly_preferences;
DROP POLICY IF EXISTS "Users can update own weekly preferences" ON weekly_preferences;
DROP POLICY IF EXISTS "Users can delete own weekly preferences" ON weekly_preferences;

CREATE POLICY "Users can view own weekly preferences" ON weekly_preferences FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create own weekly preferences" ON weekly_preferences FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own weekly preferences" ON weekly_preferences FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own weekly preferences" ON weekly_preferences FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- user_favorite_recipes
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorite_recipes;
DROP POLICY IF EXISTS "Users can create favorites" ON user_favorite_recipes;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorite_recipes;

CREATE POLICY "Users can view own favorites" ON user_favorite_recipes FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create favorites" ON user_favorite_recipes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own favorites" ON user_favorite_recipes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- households
DROP POLICY IF EXISTS "Users can create households" ON households;
DROP POLICY IF EXISTS "Household admins can update household" ON households;
DROP POLICY IF EXISTS "Users can view households they created or belong to" ON households;

CREATE POLICY "Users can create households" ON households FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Household admins can update household" ON households FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = households.id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = households.id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'));

CREATE POLICY "Users can view households they created or belong to" ON households FOR SELECT TO authenticated 
  USING (created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = households.id AND household_members.user_id = (select auth.uid())));

-- household_members
DROP POLICY IF EXISTS "Users can join households" ON household_members;
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;

CREATE POLICY "Users can join households" ON household_members FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view household members" ON household_members FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_members.household_id AND hm.user_id = (select auth.uid())));

CREATE POLICY "Admins can manage household members" ON household_members FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_members.household_id AND hm.user_id = (select auth.uid()) AND hm.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_members.household_id AND hm.user_id = (select auth.uid()) AND hm.role = 'admin'));

-- household_dependents
DROP POLICY IF EXISTS "Household members can view dependents" ON household_dependents;
DROP POLICY IF EXISTS "Household admins can add dependents" ON household_dependents;
DROP POLICY IF EXISTS "Household admins can update dependents" ON household_dependents;
DROP POLICY IF EXISTS "Household admins can delete dependents" ON household_dependents;

CREATE POLICY "Household members can view dependents" ON household_dependents FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_dependents.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household admins can add dependents" ON household_dependents FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_dependents.household_id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'));

CREATE POLICY "Household admins can update dependents" ON household_dependents FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_dependents.household_id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_dependents.household_id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'));

CREATE POLICY "Household admins can delete dependents" ON household_dependents FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_dependents.household_id AND household_members.user_id = (select auth.uid()) AND household_members.role = 'admin'));

-- recipes
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can view public recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

CREATE POLICY "Users can create recipes" ON recipes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Anyone can view public recipes" ON recipes FOR SELECT TO authenticated 
  USING (is_public = true OR created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM recipe_shares WHERE recipe_shares.recipe_id = recipes.id AND recipe_shares.shared_with = (select auth.uid())));

CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE TO authenticated USING (created_by = (select auth.uid())) WITH CHECK (created_by = (select auth.uid()));
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE TO authenticated USING (created_by = (select auth.uid()));

-- recipe_ingredients
DROP POLICY IF EXISTS "Anyone can view recipe ingredients for accessible recipes" ON recipe_ingredients;
DROP POLICY IF EXISTS "Recipe owners can add recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Recipe owners can update recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Recipe owners can delete recipe ingredients" ON recipe_ingredients;

CREATE POLICY "Anyone can view recipe ingredients for accessible recipes" ON recipe_ingredients FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND (recipes.is_public = true OR recipes.created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM recipe_shares WHERE recipe_shares.recipe_id = recipes.id AND recipe_shares.shared_with = (select auth.uid())))));

CREATE POLICY "Recipe owners can add recipe ingredients" ON recipe_ingredients FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.created_by = (select auth.uid())));

CREATE POLICY "Recipe owners can update recipe ingredients" ON recipe_ingredients FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.created_by = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.created_by = (select auth.uid())));

CREATE POLICY "Recipe owners can delete recipe ingredients" ON recipe_ingredients FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.created_by = (select auth.uid())));

-- recipe_appliances
DROP POLICY IF EXISTS "Anyone can view recipe appliances for accessible recipes" ON recipe_appliances;
DROP POLICY IF EXISTS "Recipe owners can add recipe appliances" ON recipe_appliances;
DROP POLICY IF EXISTS "Recipe owners can update recipe appliances" ON recipe_appliances;
DROP POLICY IF EXISTS "Recipe owners can delete recipe appliances" ON recipe_appliances;

CREATE POLICY "Anyone can view recipe appliances for accessible recipes" ON recipe_appliances FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_appliances.recipe_id AND (recipes.is_public = true OR recipes.created_by = (select auth.uid()) OR EXISTS (SELECT 1 FROM recipe_shares WHERE recipe_shares.recipe_id = recipes.id AND recipe_shares.shared_with = (select auth.uid())))));

CREATE POLICY "Recipe owners can add recipe appliances" ON recipe_appliances FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_appliances.recipe_id AND recipes.created_by = (select auth.uid())));

CREATE POLICY "Recipe owners can update recipe appliances" ON recipe_appliances FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_appliances.recipe_id AND recipes.created_by = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_appliances.recipe_id AND recipes.created_by = (select auth.uid())));

CREATE POLICY "Recipe owners can delete recipe appliances" ON recipe_appliances FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_appliances.recipe_id AND recipes.created_by = (select auth.uid())));

-- meal_ratings
DROP POLICY IF EXISTS "Users can view own ratings" ON meal_ratings;
DROP POLICY IF EXISTS "Household members can view household ratings" ON meal_ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON meal_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON meal_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON meal_ratings;

CREATE POLICY "Users can view own ratings" ON meal_ratings FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "Household members can view household ratings" ON meal_ratings FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members hm1 WHERE hm1.user_id = (select auth.uid()) AND EXISTS (SELECT 1 FROM household_members hm2 WHERE hm2.user_id = meal_ratings.user_id AND hm2.household_id = hm1.household_id)));

CREATE POLICY "Users can create ratings" ON meal_ratings FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own ratings" ON meal_ratings FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own ratings" ON meal_ratings FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- recipe_shares
DROP POLICY IF EXISTS "Users can view shares they sent or received" ON recipe_shares;
DROP POLICY IF EXISTS "Users can share recipes" ON recipe_shares;
DROP POLICY IF EXISTS "Users can delete shares they created" ON recipe_shares;

CREATE POLICY "Users can view shares they sent or received" ON recipe_shares FOR SELECT TO authenticated USING (shared_by = (select auth.uid()) OR shared_with = (select auth.uid()));
CREATE POLICY "Users can share recipes" ON recipe_shares FOR INSERT TO authenticated WITH CHECK (shared_by = (select auth.uid()));
CREATE POLICY "Users can delete shares they created" ON recipe_shares FOR DELETE TO authenticated USING (shared_by = (select auth.uid()));

-- household_appliances
DROP POLICY IF EXISTS "Household members can view their appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can add appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can update appliances" ON household_appliances;
DROP POLICY IF EXISTS "Household members can delete appliances" ON household_appliances;

CREATE POLICY "Household members can view their appliances" ON household_appliances FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_appliances.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can add appliances" ON household_appliances FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_appliances.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can update appliances" ON household_appliances FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_appliances.household_id AND household_members.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_appliances.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can delete appliances" ON household_appliances FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_appliances.household_id AND household_members.user_id = (select auth.uid())));

-- household_implements
DROP POLICY IF EXISTS "Household members can view their implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can add implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can update implements" ON household_implements;
DROP POLICY IF EXISTS "Household members can delete implements" ON household_implements;

CREATE POLICY "Household members can view their implements" ON household_implements FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_implements.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can add implements" ON household_implements FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_implements.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can update implements" ON household_implements FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_implements.household_id AND household_members.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_implements.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can delete implements" ON household_implements FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_implements.household_id AND household_members.user_id = (select auth.uid())));

-- household_ingredients
DROP POLICY IF EXISTS "Household members can view their ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can add ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can update ingredients" ON household_ingredients;
DROP POLICY IF EXISTS "Household members can delete ingredients" ON household_ingredients;

CREATE POLICY "Household members can view their ingredients" ON household_ingredients FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_ingredients.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can add ingredients" ON household_ingredients FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_ingredients.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can update ingredients" ON household_ingredients FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_ingredients.household_id AND household_members.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_ingredients.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can delete ingredients" ON household_ingredients FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = household_ingredients.household_id AND household_members.user_id = (select auth.uid())));

-- meal_plans
DROP POLICY IF EXISTS "Household members can view their meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can update meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Household members can delete meal plans" ON meal_plans;

CREATE POLICY "Household members can view their meal plans" ON meal_plans FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = meal_plans.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can create meal plans" ON meal_plans FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = meal_plans.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can update meal plans" ON meal_plans FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = meal_plans.household_id AND household_members.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = meal_plans.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can delete meal plans" ON meal_plans FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = meal_plans.household_id AND household_members.user_id = (select auth.uid())));

-- grocery_list
DROP POLICY IF EXISTS "Household members can view their grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can add to grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can update grocery list" ON grocery_list;
DROP POLICY IF EXISTS "Household members can delete from grocery list" ON grocery_list;

CREATE POLICY "Household members can view their grocery list" ON grocery_list FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = grocery_list.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can add to grocery list" ON grocery_list FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = grocery_list.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can update grocery list" ON grocery_list FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = grocery_list.household_id AND household_members.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = grocery_list.household_id AND household_members.user_id = (select auth.uid())));

CREATE POLICY "Household members can delete from grocery list" ON grocery_list FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM household_members WHERE household_members.household_id = grocery_list.household_id AND household_members.user_id = (select auth.uid())));
