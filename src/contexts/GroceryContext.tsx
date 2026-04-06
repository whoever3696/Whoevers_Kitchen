import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';
import { useIngredient } from './IngredientContext';
import { Database } from '../lib/database.types';

type GroceryItem = Database['public']['Tables']['grocery_list']['Row'];
type Ingredient = Database['public']['Tables']['ingredients']['Row'];

export interface GroceryItemWithDetails extends GroceryItem {
  ingredient_name?: string;
  ingredient_category?: string;
  ingredient_default_storage?: string;
}

interface GroceryContextType {
  groceryItems: GroceryItemWithDetails[];
  loading: boolean;
  fetchGroceryItems: () => Promise<void>;
  addGroceryItem: (params: {
    ingredientId: string | null;
    customItemName?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => Promise<void>;
  updateGroceryItem: (id: string, params: {
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => Promise<void>;
  toggleChecked: (id: string, isChecked: boolean) => Promise<void>;
  deleteGroceryItem: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { addIngredient } = useIngredient();
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroceryItems = useCallback(async () => {
    if (!household?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grocery_list')
        .select(`
          *,
          ingredients (
            name,
            category,
            default_storage
          )
        `)
        .eq('household_id', household.id)
        .order('is_checked', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item) => ({
        ...item,
        ingredient_name: (item.ingredients as any)?.name || item.custom_item_name || 'Unknown',
        ingredient_category: (item.ingredients as any)?.category || 'other',
        ingredient_default_storage: (item.ingredients as any)?.default_storage || 'pantry',
      }));

      setGroceryItems(formattedData);
    } catch (error) {
      console.error('Error fetching grocery items:', error);
    } finally {
      setLoading(false);
    }
  }, [household?.id]);

  const addGroceryItem = useCallback(async (params: {
    ingredientId: string | null;
    customItemName?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => {
    if (!household?.id || !user?.id) {
      throw new Error('Household or user not found');
    }

    const { error } = await supabase
      .from('grocery_list')
      .insert({
        household_id: household.id,
        ingredient_id: params.ingredientId,
        custom_item_name: params.customItemName,
        quantity: params.quantity || null,
        unit: params.unit || null,
        notes: params.notes || null,
        added_by: user.id,
        is_checked: false,
      });

    if (error) throw error;

    await fetchGroceryItems();
  }, [household?.id, user?.id, fetchGroceryItems]);

  const updateGroceryItem = useCallback(async (id: string, params: {
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (params.quantity !== undefined) updateData.quantity = params.quantity;
    if (params.unit !== undefined) updateData.unit = params.unit;
    if (params.notes !== undefined) updateData.notes = params.notes;

    const { error } = await supabase
      .from('grocery_list')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    await fetchGroceryItems();
  }, [fetchGroceryItems]);

  const toggleChecked = useCallback(async (id: string, isChecked: boolean) => {
    if (!user?.id) {
      throw new Error('User not found');
    }

    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from('grocery_list')
      .update({
        is_checked: isChecked,
        checked_by: isChecked ? user.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    if (isChecked) {
      try {
        await addIngredient({
          ingredientId: item.ingredient_id,
          customName: item.custom_item_name || undefined,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'unit',
          storageLocation: (item.ingredient_default_storage as 'pantry' | 'fridge' | 'freezer') || 'pantry',
        });
      } catch (error) {
        console.error('Error adding ingredient:', error);
      }
    }

    await fetchGroceryItems();
  }, [user?.id, groceryItems, addIngredient, fetchGroceryItems]);

  const deleteGroceryItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('grocery_list')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await fetchGroceryItems();
  }, [fetchGroceryItems]);

  const clearCheckedItems = useCallback(async () => {
    if (!household?.id) return;

    const { error } = await supabase
      .from('grocery_list')
      .delete()
      .eq('household_id', household.id)
      .eq('is_checked', true);

    if (error) throw error;

    await fetchGroceryItems();
  }, [household?.id, fetchGroceryItems]);

  return (
    <GroceryContext.Provider
      value={{
        groceryItems,
        loading,
        fetchGroceryItems,
        addGroceryItem,
        updateGroceryItem,
        toggleChecked,
        deleteGroceryItem,
        clearCheckedItems,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
}
