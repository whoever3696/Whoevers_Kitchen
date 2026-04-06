export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appliances: {
        Row: {
          id: string
          name: string
          category: string
          default_selected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          default_selected?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          default_selected?: boolean
          created_at?: string
        }
      }
      cooking_implements: {
        Row: {
          id: string
          name: string
          category: string
          default_selected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          default_selected?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          default_selected?: boolean
          created_at?: string
        }
      }
      dietary_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'budget' | 'vegetable_diversity' | 'protein_diversity' | 'min_calories' | 'min_protein' | 'allergy' | 'flexible_restriction' | 'lifestyle'
          goal_value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'budget' | 'vegetable_diversity' | 'protein_diversity' | 'min_calories' | 'min_protein' | 'allergy' | 'flexible_restriction' | 'lifestyle'
          goal_value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'budget' | 'vegetable_diversity' | 'protein_diversity' | 'min_calories' | 'min_protein' | 'allergy' | 'flexible_restriction' | 'lifestyle'
          goal_value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      grocery_list: {
        Row: {
          id: string
          household_id: string
          ingredient_id: string | null
          custom_item_name: string | null
          quantity: number | null
          unit: string | null
          is_checked: boolean
          auto_generated: boolean
          notes: string | null
          added_by: string | null
          checked_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          ingredient_id?: string | null
          custom_item_name?: string | null
          quantity?: number | null
          unit?: string | null
          is_checked?: boolean
          auto_generated?: boolean
          notes?: string | null
          added_by?: string | null
          checked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          ingredient_id?: string | null
          custom_item_name?: string | null
          quantity?: number | null
          unit?: string | null
          is_checked?: boolean
          auto_generated?: boolean
          notes?: string | null
          added_by?: string | null
          checked_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      household_appliances: {
        Row: {
          id: string
          household_id: string
          appliance_id: string | null
          custom_name: string | null
          details: Json
          location: string
          added_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          appliance_id?: string | null
          custom_name?: string | null
          details?: Json
          location?: string
          added_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          appliance_id?: string | null
          custom_name?: string | null
          details?: Json
          location?: string
          added_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      household_implements: {
        Row: {
          id: string
          household_id: string
          implement_id: string | null
          custom_name: string | null
          quantity: number
          location: string
          added_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          implement_id?: string | null
          custom_name?: string | null
          quantity?: number
          location?: string
          added_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          implement_id?: string | null
          custom_name?: string | null
          quantity?: number
          location?: string
          added_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      household_ingredients: {
        Row: {
          id: string
          household_id: string
          ingredient_id: string | null
          custom_name: string | null
          quantity: number
          unit: string
          storage_location: 'pantry' | 'fridge' | 'freezer'
          expiration_date: string | null
          last_updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          ingredient_id?: string | null
          custom_name?: string | null
          quantity?: number
          unit: string
          storage_location: 'pantry' | 'fridge' | 'freezer'
          expiration_date?: string | null
          last_updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          ingredient_id?: string | null
          custom_name?: string | null
          quantity?: number
          unit?: string
          storage_location?: 'pantry' | 'fridge' | 'freezer'
          expiration_date?: string | null
          last_updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      household_dependents: {
        Row: {
          id: string
          household_id: string
          name: string
          age_group: 'child' | 'teen' | 'adult' | null
          dietary_restrictions: string | null
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          age_group?: 'child' | 'teen' | 'adult' | null
          dietary_restrictions?: string | null
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          age_group?: 'child' | 'teen' | 'adult' | null
          dietary_restrictions?: string | null
          added_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: 'admin' | 'member' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role: 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: 'admin' | 'member' | 'viewer'
          joined_at?: string
        }
      }
      households: {
        Row: {
          id: string
          name: string
          store_travel_time_minutes: number
          invitation_code: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          store_travel_time_minutes?: number
          invitation_code?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          store_travel_time_minutes?: number
          invitation_code?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          category: string
          default_storage: 'pantry' | 'fridge' | 'freezer' | null
          typical_shelf_life_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          default_storage?: 'pantry' | 'fridge' | 'freezer' | null
          typical_shelf_life_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          default_storage?: 'pantry' | 'fridge' | 'freezer' | null
          typical_shelf_life_days?: number | null
          created_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          household_id: string
          recipe_id: string
          scheduled_date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings: number
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          recipe_id: string
          scheduled_date: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          recipe_id?: string
          scheduled_date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          servings?: number
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_ratings: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          ease_rating: number
          taste_rating: number
          notes: string | null
          cooked_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          ease_rating: number
          taste_rating: number
          notes?: string | null
          cooked_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          ease_rating?: number
          taste_rating?: number
          notes?: string | null
          cooked_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      recipe_appliances: {
        Row: {
          id: string
          recipe_id: string
          appliance_id: string | null
          custom_appliance_name: string | null
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          appliance_id?: string | null
          custom_appliance_name?: string | null
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          appliance_id?: string | null
          custom_appliance_name?: string | null
          is_required?: boolean
          created_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string | null
          custom_ingredient_name: string | null
          quantity: number
          unit: string
          is_optional: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id?: string | null
          custom_ingredient_name?: string | null
          quantity: number
          unit: string
          is_optional?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string | null
          custom_ingredient_name?: string | null
          quantity?: number
          unit?: string
          is_optional?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      recipe_shares: {
        Row: {
          id: string
          recipe_id: string
          shared_by: string
          shared_with: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          shared_by: string
          shared_with: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          shared_by?: string
          shared_with?: string
          message?: string | null
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          description: string | null
          difficulty_level: 'fast_easy' | 'moderate' | 'fancy'
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          default_servings: number
          instructions: string
          calories_per_serving: number | null
          protein_grams_per_serving: number | null
          estimated_cost: number | null
          is_meal_prep_friendly: boolean
          created_by: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          difficulty_level: 'fast_easy' | 'moderate' | 'fancy'
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          default_servings?: number
          instructions: string
          calories_per_serving?: number | null
          protein_grams_per_serving?: number | null
          estimated_cost?: number | null
          is_meal_prep_friendly?: boolean
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          difficulty_level?: 'fast_easy' | 'moderate' | 'fancy'
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          default_servings?: number
          instructions?: string
          calories_per_serving?: number | null
          protein_grams_per_serving?: number | null
          estimated_cost?: number | null
          is_meal_prep_friendly?: boolean
          created_by?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_favorite_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string
          default_serving_size: number
          calculate_nutrition: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          default_serving_size?: number
          calculate_nutrition?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          default_serving_size?: number
          calculate_nutrition?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      weekly_preferences: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          preferred_difficulty: 'fast_easy' | 'moderate' | 'fancy' | 'any' | null
          is_meal_prep_day: boolean
          preferred_servings: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          preferred_difficulty?: 'fast_easy' | 'moderate' | 'fancy' | 'any' | null
          is_meal_prep_day?: boolean
          preferred_servings?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          preferred_difficulty?: 'fast_easy' | 'moderate' | 'fancy' | 'any' | null
          is_meal_prep_day?: boolean
          preferred_servings?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
