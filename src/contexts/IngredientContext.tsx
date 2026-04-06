import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';
import { Database } from '../lib/database.types';

type Ingredient = Database['public']['Tables']['ingredients']['Row'];
type HouseholdIngredient = Database['public']['Tables']['household_ingredients']['Row'];

export interface HouseholdIngredientWithDetails extends HouseholdIngredient {
  ingredient_name?: string;
  ingredient_category?: string;
  ingredient_default_storage?: string;
}

interface IngredientContextType {
  masterIngredients: Ingredient[];
  householdIngredients: HouseholdIngredientWithDetails[];
  loading: boolean;
  fetchMasterIngredients: () => Promise<void>;
  fetchHouseholdIngredients: () => Promise<void>;
  addIngredient: (params: {
    ingredientId: string | null;
    customName?: string;
    quantity: number;
    unit: string;
    storageLocation: 'pantry' | 'fridge' | 'freezer';
    expirationDate?: string;
  }) => Promise<void>;
  updateIngredient: (id: string, params: {
    quantity?: number;
    unit?: string;
    storageLocation?: 'pantry' | 'fridge' | 'freezer';
    expirationDate?: string | null;
  }) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export function IngredientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { household } = useHousehold();
  const [masterIngredients, setMasterIngredients] = useState<Ingredient[]>([]);
  const [householdIngredients, setHouseholdIngredients] = useState<HouseholdIngredientWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMasterIngredients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setMasterIngredients(data || []);
    } catch (error) {
      console.error('Error fetching master ingredients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHouseholdIngredients = useCallback(async () => {
    if (!household?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('household_ingredients')
        .select(`
          *,
          ingredients (
            name,
            category,
            default_storage
          )
        `)
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item) => ({
        ...item,
        ingredient_name: (item.ingredients as any)?.name || item.custom_name || 'Unknown',
        ingredient_category: (item.ingredients as any)?.category || 'other',
        ingredient_default_storage: (item.ingredients as any)?.default_storage || 'pantry',
      }));

      setHouseholdIngredients(formattedData);
    } catch (error) {
      console.error('Error fetching household ingredients:', error);
    } finally {
      setLoading(false);
    }
  }, [household?.id]);

  const addIngredient = useCallback(async (params: {
    ingredientId: string | null;
    customName?: string;
    quantity: number;
    unit: string;
    storageLocation: 'pantry' | 'fridge' | 'freezer';
    expirationDate?: string;
  }) => {
    if (!household?.id || !user?.id) {
      throw new Error('Household or user not found');
    }

    const { data, error } = await supabase
      .from('household_ingredients')
      .insert({
        household_id: household.id,
        ingredient_id: params.ingredientId,
        custom_name: params.customName,
        quantity: params.quantity,
        unit: params.unit,
        storage_location: params.storageLocation,
        expiration_date: params.expirationDate || null,
        last_updated_by: user.id,
      })
      .select();

    if (error) throw error;

    await fetchHouseholdIngredients();
  }, [household?.id, user?.id, fetchHouseholdIngredients]);

  const updateIngredient = useCallback(async (id: string, params: {
    quantity?: number;
    unit?: string;
    storageLocation?: 'pantry' | 'fridge' | 'freezer';
    expirationDate?: string | null;
  }) => {
    if (!user?.id) {
      throw new Error('User not found');
    }

    const updateData: any = {
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (params.quantity !== undefined) updateData.quantity = params.quantity;
    if (params.unit !== undefined) updateData.unit = params.unit;
    if (params.storageLocation !== undefined) updateData.storage_location = params.storageLocation;
    if (params.expirationDate !== undefined) updateData.expiration_date = params.expirationDate;

    const { error } = await supabase
      .from('household_ingredients')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    await fetchHouseholdIngredients();
  }, [user?.id, fetchHouseholdIngredients]);

  const deleteIngredient = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('household_ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await fetchHouseholdIngredients();
  }, [fetchHouseholdIngredients]);

  return (
    <IngredientContext.Provider
      value={{
        masterIngredients,
        householdIngredients,
        loading,
        fetchMasterIngredients,
        fetchHouseholdIngredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
      }}
    >
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredient() {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error('useIngredient must be used within an IngredientProvider');
  }
  return context;
}
