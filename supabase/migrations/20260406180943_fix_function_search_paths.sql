/*
  # Fix Function Search Paths

  1. Security Improvements
    - Add SET search_path to all functions to make them search path immutable
    - This prevents potential security issues from search path manipulation
  
  2. Functions Modified
    - update_updated_at_column()
    - is_household_member()
    - is_household_admin()
*/

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Fix is_household_member function
CREATE OR REPLACE FUNCTION is_household_member(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id
    AND user_id = p_user_id
  );
$$;

-- Fix is_household_admin function
CREATE OR REPLACE FUNCTION is_household_admin(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id
    AND user_id = p_user_id
    AND role = 'admin'
  );
$$;
