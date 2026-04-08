/*
  # Add Receipt Tracking Tables

  ## Overview
  Creates tables to track receipt scans and enable budget analysis without storing images.

  ## New Tables
    - `receipt_scans`
      - `id` (uuid, primary key)
      - `household_id` (uuid, foreign key to households)
      - `store_name` (text, optional)
      - `scan_date` (timestamptz, when scanned)
      - `purchase_date` (date, from receipt)
      - `total_amount` (decimal, total from receipt)
      - `item_count` (int, number of items)
      - `scanned_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)

    - `receipt_items`
      - `id` (uuid, primary key)
      - `receipt_scan_id` (uuid, foreign key to receipt_scans)
      - `item_name` (text, as written on receipt)
      - `quantity` (decimal)
      - `unit` (text)
      - `price` (decimal, item price)
      - `ingredient_id` (uuid, foreign key to ingredients, nullable)
      - `household_ingredient_id` (uuid, foreign key to household_ingredients, nullable)
      - `created_at` (timestamptz)

  ## Modified Tables
    - `household_ingredients` - Add purchase_price and purchase_date columns

  ## Security
    - Enable RLS on both new tables
    - Users can only access receipts from their households
*/

-- Add purchase tracking to household_ingredients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_ingredients' AND column_name = 'purchase_price'
  ) THEN
    ALTER TABLE household_ingredients ADD COLUMN purchase_price decimal(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'household_ingredients' AND column_name = 'purchase_date'
  ) THEN
    ALTER TABLE household_ingredients ADD COLUMN purchase_date date;
  END IF;
END $$;

-- Receipt scans table
CREATE TABLE IF NOT EXISTS receipt_scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  store_name text,
  scan_date timestamptz DEFAULT now(),
  purchase_date date,
  total_amount decimal(10, 2),
  item_count int DEFAULT 0 CHECK (item_count >= 0),
  scanned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_scan_id uuid NOT NULL REFERENCES receipt_scans(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity decimal(10, 2),
  unit text,
  price decimal(10, 2),
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  household_ingredient_id uuid REFERENCES household_ingredients(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipt_scans_household_id ON receipt_scans(household_id);
CREATE INDEX IF NOT EXISTS idx_receipt_scans_purchase_date ON receipt_scans(purchase_date);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_scan_id ON receipt_items(receipt_scan_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_ingredient_id ON receipt_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_household_ingredients_purchase_date ON household_ingredients(purchase_date);

-- Enable RLS
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for receipt_scans
CREATE POLICY "Users can view receipts from their households"
  ON receipt_scans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = receipt_scans.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create receipts for their households"
  ON receipt_scans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = receipt_scans.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own receipt scans"
  ON receipt_scans FOR DELETE
  TO authenticated
  USING (scanned_by = auth.uid());

-- RLS Policies for receipt_items
CREATE POLICY "Users can view receipt items from their households"
  ON receipt_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipt_scans
      JOIN household_members ON household_members.household_id = receipt_scans.household_id
      WHERE receipt_scans.id = receipt_items.receipt_scan_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create receipt items for their household receipts"
  ON receipt_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipt_scans
      JOIN household_members ON household_members.household_id = receipt_scans.household_id
      WHERE receipt_scans.id = receipt_items.receipt_scan_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their own receipts"
  ON receipt_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipt_scans
      WHERE receipt_scans.id = receipt_items.receipt_scan_id
      AND receipt_scans.scanned_by = auth.uid()
    )
  );