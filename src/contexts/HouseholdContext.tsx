import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/database.types';

type Household = Database['public']['Tables']['households']['Row'];
type HouseholdMember = Database['public']['Tables']['household_members']['Row'];
type HouseholdDependent = Database['public']['Tables']['household_dependents']['Row'];

interface HouseholdContextType {
  household: Household | null;
  members: HouseholdMember[];
  dependents: HouseholdDependent[];
  loading: boolean;
  createHousehold: (name: string, travelTime: number) => Promise<{ error: Error | null }>;
  joinHousehold: (invitationCode: string) => Promise<{ error: Error | null }>;
  leaveHousehold: () => Promise<{ error: Error | null }>;
  refreshHousehold: () => Promise<void>;
  addDependent: (name: string, ageGroup?: 'child' | 'teen' | 'adult', dietaryRestrictions?: string) => Promise<{ error: Error | null }>;
  updateDependent: (id: string, name: string, ageGroup?: 'child' | 'teen' | 'adult', dietaryRestrictions?: string) => Promise<{ error: Error | null }>;
  removeDependent: (id: string) => Promise<{ error: Error | null }>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [dependents, setDependents] = useState<HouseholdDependent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHousehold = async () => {
    if (!user) {
      setHousehold(null);
      setMembers([]);
      setDependents([]);
      setLoading(false);
      return;
    }

    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (memberData) {
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', memberData.household_id)
          .single();

        if (householdError) throw householdError;

        setHousehold(householdData);

        const { data: allMembers, error: membersError } = await supabase
          .from('household_members')
          .select('*')
          .eq('household_id', memberData.household_id);

        if (membersError) throw membersError;

        setMembers(allMembers || []);

        const { data: allDependents, error: dependentsError } = await supabase
          .from('household_dependents')
          .select('*')
          .eq('household_id', memberData.household_id);

        if (dependentsError) throw dependentsError;

        setDependents(allDependents || []);
      } else {
        setHousehold(null);
        setMembers([]);
        setDependents([]);
      }
    } catch (error) {
      console.error('Error fetching household:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, [user]);

  const createHousehold = async (name: string, travelTime: number) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({
          name,
          store_travel_time_minutes: travelTime,
          created_by: user.id,
        })
        .select()
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        throw householdError;
      }

      if (!householdData) {
        throw new Error('Failed to create household: No data returned');
      }

      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        throw memberError;
      }

      await fetchHousehold();
      return { error: null };
    } catch (error) {
      console.error('Create household failed:', error);
      return { error: error as Error };
    }
  };

  const joinHousehold = async (invitationCode: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('invitation_code', invitationCode)
        .maybeSingle();

      if (householdError) throw householdError;
      if (!householdData) throw new Error('Invalid invitation code');

      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) throw memberError;

      await fetchHousehold();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const leaveHousehold = async () => {
    if (!user || !household) return { error: new Error('No household to leave') };

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('user_id', user.id)
        .eq('household_id', household.id);

      if (error) throw error;

      setHousehold(null);
      setMembers([]);
      setDependents([]);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshHousehold = async () => {
    await fetchHousehold();
  };

  const addDependent = async (
    name: string,
    ageGroup?: 'child' | 'teen' | 'adult',
    dietaryRestrictions?: string
  ) => {
    if (!user || !household) return { error: new Error('No household selected') };

    try {
      const { error } = await supabase
        .from('household_dependents')
        .insert({
          household_id: household.id,
          name,
          age_group: ageGroup || null,
          dietary_restrictions: dietaryRestrictions || null,
          added_by: user.id,
        });

      if (error) throw error;

      await fetchHousehold();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateDependent = async (
    id: string,
    name: string,
    ageGroup?: 'child' | 'teen' | 'adult',
    dietaryRestrictions?: string
  ) => {
    if (!user || !household) return { error: new Error('No household selected') };

    try {
      const { error } = await supabase
        .from('household_dependents')
        .update({
          name,
          age_group: ageGroup || null,
          dietary_restrictions: dietaryRestrictions || null,
        })
        .eq('id', id)
        .eq('household_id', household.id);

      if (error) throw error;

      await fetchHousehold();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeDependent = async (id: string) => {
    if (!user || !household) return { error: new Error('No household selected') };

    try {
      const { error } = await supabase
        .from('household_dependents')
        .delete()
        .eq('id', id)
        .eq('household_id', household.id);

      if (error) throw error;

      await fetchHousehold();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <HouseholdContext.Provider
      value={{
        household,
        members,
        dependents,
        loading,
        createHousehold,
        joinHousehold,
        leaveHousehold,
        refreshHousehold,
        addDependent,
        updateDependent,
        removeDependent,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
}
