/*
  # Whoever's Kitchen - Database Tables

  ## Overview
  Creates all database tables for the Whoever's Kitchen app.
  Policies will be added in a separate migration.

  ## Tables Created
    - user_profiles - Extended user information
    - households - Shared kitchen spaces
    - household_members - Users in households with roles
    - appliances - Master appliance list
    - household_appliances - Household-specific appliances
    - cooking_implements - Master cooking tools list
    - household_implements - Household-specific tools
    - ingredients - Master ingredient list
    - household_ingredients - Household ingredient inventory
    - recipes - Recipe database
    - recipe_ingredients - Recipe ingredient requirements
    - recipe_appliances - Recipe equipment requirements
    - meal_plans - Scheduled meals
    - weekly_preferences - User preferences by day
    - dietary_goals - User dietary preferences
    - meal_ratings - User ratings for recipes
    - user_favorite_recipes - Saved favorites
    - recipe_shares - Shared recipes
    - grocery_list - Household shopping list
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  default_serving_size int DEFAULT 4 CHECK (default_serving_size > 0),
  calculate_nutrition boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Households
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  store_travel_time_minutes int DEFAULT 15 CHECK (store_travel_time_minutes >= 0),
  invitation_code text UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Household members
CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Master appliances
CREATE TABLE IF NOT EXISTS appliances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  default_selected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Household appliances
CREATE TABLE IF NOT EXISTS household_appliances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  appliance_id uuid REFERENCES appliances(id) ON DELETE SET NULL,
  custom_name text,
  details jsonb DEFAULT '{}',
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Master cooking implements
CREATE TABLE IF NOT EXISTS cooking_implements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  default_selected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Household implements
CREATE TABLE IF NOT EXISTS household_implements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  implement_id uuid REFERENCES cooking_implements(id) ON DELETE SET NULL,
  custom_name text,
  quantity int DEFAULT 1 CHECK (quantity > 0),
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Master ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  default_storage text CHECK (default_storage IN ('pantry', 'fridge', 'freezer')),
  typical_shelf_life_days int,
  created_at timestamptz DEFAULT now()
);

-- Household ingredients
CREATE TABLE IF NOT EXISTS household_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  custom_name text,
  quantity decimal(10, 2) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  storage_location text NOT NULL CHECK (storage_location IN ('pantry', 'fridge', 'freezer')),
  expiration_date date,
  last_updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('fast_easy', 'moderate', 'fancy')),
  prep_time_minutes int CHECK (prep_time_minutes >= 0),
  cook_time_minutes int CHECK (cook_time_minutes >= 0),
  default_servings int DEFAULT 4 CHECK (default_servings > 0),
  instructions text NOT NULL,
  calories_per_serving int,
  protein_grams_per_serving decimal(10, 2),
  estimated_cost decimal(10, 2),
  is_meal_prep_friendly boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  custom_ingredient_name text,
  quantity decimal(10, 2) NOT NULL,
  unit text NOT NULL,
  is_optional boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Recipe appliances
CREATE TABLE IF NOT EXISTS recipe_appliances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  appliance_id uuid REFERENCES appliances(id) ON DELETE SET NULL,
  custom_appliance_name text,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings int NOT NULL CHECK (servings > 0),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weekly preferences
CREATE TABLE IF NOT EXISTS weekly_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  preferred_difficulty text CHECK (preferred_difficulty IN ('fast_easy', 'moderate', 'fancy', 'any')),
  is_meal_prep_day boolean DEFAULT false,
  preferred_servings int CHECK (preferred_servings > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Dietary goals
CREATE TABLE IF NOT EXISTS dietary_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('budget', 'vegetable_diversity', 'protein_diversity', 'min_calories', 'min_protein', 'allergy', 'flexible_restriction', 'lifestyle')),
  goal_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal ratings
CREATE TABLE IF NOT EXISTS meal_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ease_rating int NOT NULL CHECK (ease_rating >= -2 AND ease_rating <= 2 AND ease_rating != 0),
  taste_rating int NOT NULL CHECK (taste_rating >= -2 AND taste_rating <= 2 AND taste_rating != 0),
  notes text,
  cooked_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User favorite recipes
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Recipe shares
CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, shared_by, shared_with)
);

-- Grocery list
CREATE TABLE IF NOT EXISTS grocery_list (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  custom_item_name text,
  quantity decimal(10, 2),
  unit text,
  is_checked boolean DEFAULT false,
  auto_generated boolean DEFAULT false,
  notes text,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  checked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_appliances_household_id ON household_appliances(household_id);
CREATE INDEX IF NOT EXISTS idx_household_implements_household_id ON household_implements(household_id);
CREATE INDEX IF NOT EXISTS idx_household_ingredients_household_id ON household_ingredients(household_id);
CREATE INDEX IF NOT EXISTS idx_household_ingredients_expiration ON household_ingredients(expiration_date);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_meal_plans_household_date ON meal_plans(household_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meal_ratings_user_recipe ON meal_ratings(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS idx_grocery_list_household ON grocery_list(household_id);
