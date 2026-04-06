import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/database.types';
import type { GoalType, GoalValue } from '../types/dietaryGoals';

type DietaryGoal = Database['public']['Tables']['dietary_goals']['Row'];

interface DietaryGoalsContextType {
  goals: DietaryGoal[];
  loading: boolean;
  addGoal: (goalType: GoalType, goalValue: GoalValue) => Promise<{ error: Error | null }>;
  updateGoal: (id: string, goalValue: GoalValue) => Promise<{ error: Error | null }>;
  deleteGoal: (id: string) => Promise<{ error: Error | null }>;
  refreshGoals: () => Promise<void>;
}

const DietaryGoalsContext = createContext<DietaryGoalsContextType | undefined>(undefined);

export function DietaryGoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DietaryGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dietary_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching dietary goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const addGoal = async (goalType: GoalType, goalValue: GoalValue) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('dietary_goals')
        .insert({
          user_id: user.id,
          goal_type: goalType,
          goal_value: goalValue as any,
        });

      if (error) throw error;

      await fetchGoals();
      return { error: null };
    } catch (error) {
      console.error('Error adding goal:', error);
      return { error: error as Error };
    }
  };

  const updateGoal = async (id: string, goalValue: GoalValue) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('dietary_goals')
        .update({
          goal_value: goalValue as any,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchGoals();
      return { error: null };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { error: error as Error };
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('dietary_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchGoals();
      return { error: null };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { error: error as Error };
    }
  };

  const refreshGoals = async () => {
    await fetchGoals();
  };

  return (
    <DietaryGoalsContext.Provider
      value={{
        goals,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        refreshGoals,
      }}
    >
      {children}
    </DietaryGoalsContext.Provider>
  );
}

export function useDietaryGoals() {
  const context = useContext(DietaryGoalsContext);
  if (context === undefined) {
    throw new Error('useDietaryGoals must be used within a DietaryGoalsProvider');
  }
  return context;
}
