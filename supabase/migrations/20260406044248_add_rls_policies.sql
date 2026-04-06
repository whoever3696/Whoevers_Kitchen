/*
  # Whoever's Kitchen - Row Level Security Policies

  ## Overview
  Enables RLS and creates security policies for all tables.

  ## Security Model
    - Users can only access their own profiles and preferences
    - Household members can access shared household data
    - Admins have additional permissions for household management
    - Recipe creators control their recipes
    - Public recipes are viewable by all authenticated users
*/

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_implements ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_implements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Households Policies
CREATE POLICY "Household members can view their household"
  ON households FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Household admins can update household"
  ON households FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Household Members Policies
CREATE POLICY "Users can view household members of their household"
  ON household_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join households"
  ON household_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'admin'
    )
  );

-- Appliances Policies
CREATE POLICY "Anyone can view appliances"
  ON appliances FOR SELECT
  TO authenticated
  USING (true);

-- Household Appliances Policies
CREATE POLICY "Household members can view their appliances"
  ON household_appliances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_appliances.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can add appliances"
  ON household_appliances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_appliances.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can update appliances"
  ON household_appliances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_appliances.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_appliances.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can delete appliances"
  ON household_appliances FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_appliances.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

-- Cooking Implements Policies
CREATE POLICY "Anyone can view cooking implements"
  ON cooking_implements FOR SELECT
  TO authenticated
  USING (true);

-- Household Implements Policies
CREATE POLICY "Household members can view their implements"
  ON household_implements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_implements.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can add implements"
  ON household_implements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_implements.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can update implements"
  ON household_implements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_implements.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_implements.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can delete implements"
  ON household_implements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_implements.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

-- Ingredients Policies
CREATE POLICY "Anyone can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

-- Household Ingredients Policies
CREATE POLICY "Household members can view their ingredients"
  ON household_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_ingredients.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can add ingredients"
  ON household_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_ingredients.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can update ingredients"
  ON household_ingredients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_ingredients.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_ingredients.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can delete ingredients"
  ON household_ingredients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_ingredients.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

-- Recipes Policies
CREATE POLICY "Anyone can view public recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Recipe Ingredients Policies
CREATE POLICY "Anyone can view recipe ingredients for accessible recipes"
  ON recipe_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Recipe owners can add recipe ingredients"
  ON recipe_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

CREATE POLICY "Recipe owners can update recipe ingredients"
  ON recipe_ingredients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

CREATE POLICY "Recipe owners can delete recipe ingredients"
  ON recipe_ingredients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

-- Recipe Appliances Policies
CREATE POLICY "Anyone can view recipe appliances for accessible recipes"
  ON recipe_appliances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_appliances.recipe_id
      AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Recipe owners can add recipe appliances"
  ON recipe_appliances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_appliances.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

CREATE POLICY "Recipe owners can update recipe appliances"
  ON recipe_appliances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_appliances.recipe_id
      AND recipes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_appliances.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

CREATE POLICY "Recipe owners can delete recipe appliances"
  ON recipe_appliances FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_appliances.recipe_id
      AND recipes.created_by = auth.uid()
    )
  );

-- Meal Plans Policies
CREATE POLICY "Household members can view their meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can update meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can delete meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

-- Weekly Preferences Policies
CREATE POLICY "Users can view own weekly preferences"
  ON weekly_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own weekly preferences"
  ON weekly_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly preferences"
  ON weekly_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly preferences"
  ON weekly_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dietary Goals Policies
CREATE POLICY "Users can view own dietary goals"
  ON dietary_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dietary goals"
  ON dietary_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dietary goals"
  ON dietary_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dietary goals"
  ON dietary_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Meal Ratings Policies
CREATE POLICY "Users can view own ratings"
  ON meal_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Household members can view household ratings"
  ON meal_ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm1
      WHERE hm1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM household_members hm2
        WHERE hm2.user_id = meal_ratings.user_id
        AND hm2.household_id = hm1.household_id
      )
    )
  );

CREATE POLICY "Users can create ratings"
  ON meal_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON meal_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON meal_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Favorite Recipes Policies
CREATE POLICY "Users can view own favorites"
  ON user_favorite_recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON user_favorite_recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorite_recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recipe Shares Policies
CREATE POLICY "Users can view shares they sent or received"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can share recipes"
  ON recipe_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete shares they created"
  ON recipe_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = shared_by);

-- Grocery List Policies
CREATE POLICY "Household members can view their grocery list"
  ON grocery_list FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_list.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can add to grocery list"
  ON grocery_list FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_list.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can update grocery list"
  ON grocery_list FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_list.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_list.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Household members can delete from grocery list"
  ON grocery_list FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_list.household_id
      AND household_members.user_id = auth.uid()
      AND household_members.role IN ('admin', 'member')
    )
  );
