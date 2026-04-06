import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';
import { Database } from '../lib/database.types';

type Appliance = Database['public']['Tables']['appliances']['Row'];
type CookingImplement = Database['public']['Tables']['cooking_implements']['Row'];

export interface KitchenLocation {
  location: string;
  applianceCount: number;
  implementCount: number;
}

interface KitchenContextType {
  appliances: Appliance[];
  cookingImplements: CookingImplement[];
  locations: KitchenLocation[];
  loading: boolean;
  fetchMasterLists: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  saveKitchenItems: (location: string, applianceIds: string[], implementIds: string[]) => Promise<void>;
  getKitchenItems: (location: string) => Promise<{ appliances: string[]; implements: string[] }>;
  deleteKitchenLocation: (location: string) => Promise<void>;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export function KitchenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { household } = useHousehold();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [cookingImplements, setCookingImplements] = useState<CookingImplement[]>([]);
  const [locations, setLocations] = useState<KitchenLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMasterLists = useCallback(async () => {
    setLoading(true);
    try {
      const [appliancesRes, implementsRes] = await Promise.all([
        supabase.from('appliances').select('*').order('category, name'),
        supabase.from('cooking_implements').select('*').order('category, name'),
      ]);

      if (appliancesRes.error) throw appliancesRes.error;
      if (implementsRes.error) throw implementsRes.error;

      setAppliances(appliancesRes.data || []);
      setCookingImplements(implementsRes.data || []);
    } catch (error) {
      console.error('Error fetching master lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    if (!household?.id) return;

    setLoading(true);
    try {
      const [appliancesRes, implementsRes] = await Promise.all([
        supabase
          .from('household_appliances')
          .select('location')
          .eq('household_id', household.id),
        supabase
          .from('household_implements')
          .select('location')
          .eq('household_id', household.id),
      ]);

      if (appliancesRes.error) throw appliancesRes.error;
      if (implementsRes.error) throw implementsRes.error;

      const locationMap = new Map<string, { appliances: number; implements: number }>();

      appliancesRes.data?.forEach((item) => {
        const loc = locationMap.get(item.location) || { appliances: 0, implements: 0 };
        loc.appliances += 1;
        locationMap.set(item.location, loc);
      });

      implementsRes.data?.forEach((item) => {
        const loc = locationMap.get(item.location) || { appliances: 0, implements: 0 };
        loc.implements += 1;
        locationMap.set(item.location, loc);
      });

      const locationsList: KitchenLocation[] = Array.from(locationMap.entries()).map(
        ([location, counts]) => ({
          location,
          applianceCount: counts.appliances,
          implementCount: counts.implements,
        })
      );

      setLocations(locationsList);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, [household]);

  const saveKitchenItems = useCallback(
    async (location: string, applianceIds: string[], implementIds: string[]) => {
      if (!household?.id || !user?.id) return;

      setLoading(true);
      try {
        const applianceInserts = applianceIds.map((id) => ({
          household_id: household.id,
          appliance_id: id,
          location,
          added_by: user.id,
        }));

        const implementInserts = implementIds.map((id) => ({
          household_id: household.id,
          implement_id: id,
          location,
          quantity: 1,
          added_by: user.id,
        }));

        await supabase.from('household_appliances').delete().eq('household_id', household.id).eq('location', location);

        await supabase.from('household_implements').delete().eq('household_id', household.id).eq('location', location);

        if (applianceInserts.length > 0) {
          const { error: applianceError } = await supabase
            .from('household_appliances')
            .insert(applianceInserts);

          if (applianceError) throw applianceError;
        }

        if (implementInserts.length > 0) {
          const { error: implementError } = await supabase
            .from('household_implements')
            .insert(implementInserts);

          if (implementError) throw implementError;
        }

        await fetchLocations();
      } catch (error) {
        console.error('Error saving kitchen items:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [household, user, fetchLocations]
  );

  const getKitchenItems = useCallback(
    async (location: string): Promise<{ appliances: string[]; implements: string[] }> => {
      if (!household?.id) return { appliances: [], implements: [] };

      try {
        const [appliancesRes, implementsRes] = await Promise.all([
          supabase
            .from('household_appliances')
            .select('appliance_id')
            .eq('household_id', household.id)
            .eq('location', location),
          supabase
            .from('household_implements')
            .select('implement_id')
            .eq('household_id', household.id)
            .eq('location', location),
        ]);

        if (appliancesRes.error) throw appliancesRes.error;
        if (implementsRes.error) throw implementsRes.error;

        return {
          appliances: appliancesRes.data?.map((a) => a.appliance_id).filter(Boolean) as string[],
          implements: implementsRes.data?.map((i) => i.implement_id).filter(Boolean) as string[],
        };
      } catch (error) {
        console.error('Error fetching kitchen items:', error);
        return { appliances: [], implements: [] };
      }
    },
    [household]
  );

  const deleteKitchenLocation = useCallback(
    async (location: string) => {
      if (!household?.id) return;

      setLoading(true);
      try {
        await Promise.all([
          supabase.from('household_appliances').delete().eq('household_id', household.id).eq('location', location),
          supabase.from('household_implements').delete().eq('household_id', household.id).eq('location', location),
        ]);

        await fetchLocations();
      } catch (error) {
        console.error('Error deleting kitchen location:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [household, fetchLocations]
  );

  return (
    <KitchenContext.Provider
      value={{
        appliances,
        cookingImplements,
        locations,
        loading,
        fetchMasterLists,
        fetchLocations,
        saveKitchenItems,
        getKitchenItems,
        deleteKitchenLocation,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen() {
  const context = useContext(KitchenContext);
  if (context === undefined) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
}
