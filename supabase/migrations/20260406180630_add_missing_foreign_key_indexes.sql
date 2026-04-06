/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes on all foreign key columns that are missing them
    - This significantly improves JOIN performance and query optimization
  
  2. Tables Affected
    - dietary_goals: user_id
    - grocery_list: added_by, checked_by, ingredient_id
    - household_appliances: added_by, appliance_id
    - household_dependents: added_by
    - household_implements: added_by, implement_id
    - household_ingredients: ingredient_id, last_updated_by
    - households: created_by
    - meal_plans: created_by, recipe_id
    - meal_ratings: recipe_id
    - recipe_appliances: appliance_id, recipe_id
    - recipe_ingredients: ingredient_id, recipe_id
    - recipe_shares: shared_by, shared_with
    - recipes: created_by
    - user_favorite_recipes: recipe_id
*/

-- dietary_goals indexes
CREATE INDEX IF NOT EXISTS idx_dietary_goals_user_id ON dietary_goals(user_id);

-- grocery_list indexes
CREATE INDEX IF NOT EXISTS idx_grocery_list_added_by ON grocery_list(added_by);
CREATE INDEX IF NOT EXISTS idx_grocery_list_checked_by ON grocery_list(checked_by);
CREATE INDEX IF NOT EXISTS idx_grocery_list_ingredient_id ON grocery_list(ingredient_id);

-- household_appliances indexes
CREATE INDEX IF NOT EXISTS idx_household_appliances_added_by ON household_appliances(added_by);
CREATE INDEX IF NOT EXISTS idx_household_appliances_appliance_id ON household_appliances(appliance_id);

-- household_dependents indexes
CREATE INDEX IF NOT EXISTS idx_household_dependents_added_by ON household_dependents(added_by);

-- household_implements indexes
CREATE INDEX IF NOT EXISTS idx_household_implements_added_by ON household_implements(added_by);
CREATE INDEX IF NOT EXISTS idx_household_implements_implement_id ON household_implements(implement_id);

-- household_ingredients indexes
CREATE INDEX IF NOT EXISTS idx_household_ingredients_ingredient_id ON household_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_household_ingredients_last_updated_by ON household_ingredients(last_updated_by);

-- households indexes
CREATE INDEX IF NOT EXISTS idx_households_created_by ON households(created_by);

-- meal_plans indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_by ON meal_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);

-- meal_ratings indexes
CREATE INDEX IF NOT EXISTS idx_meal_ratings_recipe_id ON meal_ratings(recipe_id);

-- recipe_appliances indexes
CREATE INDEX IF NOT EXISTS idx_recipe_appliances_appliance_id ON recipe_appliances(appliance_id);
CREATE INDEX IF NOT EXISTS idx_recipe_appliances_recipe_id ON recipe_appliances(recipe_id);

-- recipe_ingredients indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- recipe_shares indexes
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_by ON recipe_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_with ON recipe_shares(shared_with);

-- recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);

-- user_favorite_recipes indexes
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_recipe_id ON user_favorite_recipes(recipe_id);
