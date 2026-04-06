/*
  # Seed Master Data

  ## Overview
  Populates master lists for appliances, cooking implements, and common ingredients.

  ## Data Added
    - Common kitchen appliances with defaults
    - Standard cooking implements and tools
    - Frequently used ingredients with storage recommendations
*/

-- Insert common appliances
INSERT INTO appliances (name, category, default_selected) VALUES
  ('Stove/Cooktop', 'cooking', true),
  ('Oven', 'cooking', true),
  ('Microwave', 'cooking', true),
  ('Refrigerator', 'storage', true),
  ('Freezer', 'storage', true),
  ('Toaster', 'cooking', false),
  ('Toaster Oven', 'cooking', false),
  ('Air Fryer', 'cooking', false),
  ('Slow Cooker/Crock Pot', 'cooking', false),
  ('Instant Pot/Pressure Cooker', 'cooking', false),
  ('Rice Cooker', 'cooking', false),
  ('Blender', 'prep', false),
  ('Food Processor', 'prep', false),
  ('Stand Mixer', 'prep', false),
  ('Hand Mixer', 'prep', false),
  ('Immersion Blender', 'prep', false),
  ('Electric Kettle', 'cooking', false),
  ('Coffee Maker', 'cooking', false),
  ('Espresso Machine', 'cooking', false),
  ('Waffle Maker', 'cooking', false),
  ('Griddle/Pancake Griddle', 'cooking', false),
  ('Deep Fryer', 'cooking', false),
  ('Sous Vide', 'cooking', false),
  ('Bread Maker', 'cooking', false),
  ('Dehydrator', 'cooking', false)
ON CONFLICT DO NOTHING;

-- Insert common cooking implements
INSERT INTO cooking_implements (name, category, default_selected) VALUES
  ('Chef''s Knife', 'knives', true),
  ('Paring Knife', 'knives', true),
  ('Bread Knife', 'knives', false),
  ('Cutting Board', 'prep', true),
  ('Mixing Bowls', 'prep', true),
  ('Measuring Cups', 'prep', true),
  ('Measuring Spoons', 'prep', true),
  ('Large Pot', 'cookware', true),
  ('Medium Pot', 'cookware', true),
  ('Small Pot', 'cookware', false),
  ('Large Frying Pan/Skillet', 'cookware', true),
  ('Medium Frying Pan', 'cookware', false),
  ('Non-stick Pan', 'cookware', true),
  ('Cast Iron Skillet', 'cookware', false),
  ('Baking Sheet', 'bakeware', true),
  ('Cake Pan', 'bakeware', false),
  ('Muffin Tin', 'bakeware', false),
  ('Casserole Dish', 'bakeware', false),
  ('Roasting Pan', 'bakeware', false),
  ('Spatula', 'utensils', true),
  ('Wooden Spoon', 'utensils', true),
  ('Slotted Spoon', 'utensils', false),
  ('Ladle', 'utensils', true),
  ('Tongs', 'utensils', true),
  ('Whisk', 'utensils', true),
  ('Can Opener', 'utensils', true),
  ('Vegetable Peeler', 'utensils', true),
  ('Grater/Zester', 'utensils', false),
  ('Colander/Strainer', 'utensils', true),
  ('Potato Masher', 'utensils', false),
  ('Rolling Pin', 'utensils', false),
  ('Kitchen Scissors', 'utensils', false),
  ('Meat Thermometer', 'utensils', false)
ON CONFLICT DO NOTHING;

-- Insert common ingredients
INSERT INTO ingredients (name, category, default_storage, typical_shelf_life_days) VALUES
  -- Pantry staples
  ('All-Purpose Flour', 'baking', 'pantry', 365),
  ('White Sugar', 'baking', 'pantry', 730),
  ('Brown Sugar', 'baking', 'pantry', 180),
  ('Salt', 'seasoning', 'pantry', 1825),
  ('Black Pepper', 'seasoning', 'pantry', 365),
  ('Olive Oil', 'oils', 'pantry', 365),
  ('Vegetable Oil', 'oils', 'pantry', 365),
  ('Baking Powder', 'baking', 'pantry', 365),
  ('Baking Soda', 'baking', 'pantry', 730),
  ('Vanilla Extract', 'baking', 'pantry', 1825),
  ('White Rice', 'grains', 'pantry', 730),
  ('Pasta', 'grains', 'pantry', 730),
  ('Dried Beans', 'legumes', 'pantry', 730),
  ('Canned Tomatoes', 'canned', 'pantry', 730),
  ('Chicken Broth', 'canned', 'pantry', 365),
  ('Vegetable Broth', 'canned', 'pantry', 365),
  ('Soy Sauce', 'condiments', 'pantry', 730),
  ('Honey', 'sweeteners', 'pantry', 1825),
  ('Garlic Powder', 'seasoning', 'pantry', 365),
  ('Onion Powder', 'seasoning', 'pantry', 365),
  ('Paprika', 'seasoning', 'pantry', 365),
  ('Cumin', 'seasoning', 'pantry', 365),
  ('Oregano', 'seasoning', 'pantry', 365),
  ('Basil', 'seasoning', 'pantry', 365),
  ('Cinnamon', 'seasoning', 'pantry', 365),
  ('Oats', 'grains', 'pantry', 365),
  ('Bread Crumbs', 'baking', 'pantry', 180),
  
  -- Refrigerated items
  ('Milk', 'dairy', 'fridge', 7),
  ('Eggs', 'dairy', 'fridge', 30),
  ('Butter', 'dairy', 'fridge', 30),
  ('Cheddar Cheese', 'dairy', 'fridge', 30),
  ('Parmesan Cheese', 'dairy', 'fridge', 90),
  ('Mozzarella Cheese', 'dairy', 'fridge', 21),
  ('Yogurt', 'dairy', 'fridge', 14),
  ('Sour Cream', 'dairy', 'fridge', 14),
  ('Cream Cheese', 'dairy', 'fridge', 30),
  ('Heavy Cream', 'dairy', 'fridge', 7),
  ('Ketchup', 'condiments', 'fridge', 180),
  ('Mustard', 'condiments', 'fridge', 365),
  ('Mayonnaise', 'condiments', 'fridge', 60),
  ('Fresh Garlic', 'vegetables', 'pantry', 90),
  ('Onions', 'vegetables', 'pantry', 30),
  ('Potatoes', 'vegetables', 'pantry', 30),
  ('Carrots', 'vegetables', 'fridge', 21),
  ('Celery', 'vegetables', 'fridge', 14),
  ('Bell Peppers', 'vegetables', 'fridge', 7),
  ('Tomatoes', 'vegetables', 'fridge', 7),
  ('Lettuce', 'vegetables', 'fridge', 7),
  ('Spinach', 'vegetables', 'fridge', 5),
  ('Broccoli', 'vegetables', 'fridge', 7),
  ('Apples', 'fruits', 'fridge', 30),
  ('Bananas', 'fruits', 'pantry', 5),
  ('Lemons', 'fruits', 'fridge', 21),
  ('Limes', 'fruits', 'fridge', 21),
  
  -- Proteins
  ('Chicken Breast', 'meat', 'fridge', 2),
  ('Ground Beef', 'meat', 'fridge', 2),
  ('Pork Chops', 'meat', 'fridge', 3),
  ('Bacon', 'meat', 'fridge', 7),
  ('Salmon', 'seafood', 'fridge', 2),
  ('Shrimp', 'seafood', 'fridge', 2),
  ('Tofu', 'plant-protein', 'fridge', 7),
  
  -- Freezer items
  ('Frozen Vegetables', 'frozen', 'freezer', 365),
  ('Frozen Berries', 'frozen', 'freezer', 365),
  ('Ice Cream', 'frozen', 'freezer', 90)
ON CONFLICT (name) DO NOTHING;
