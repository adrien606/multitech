import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuildings(data || []);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des bâtiments');
    } finally {
      setLoading(false);
    }
  };

  const createBuilding = async (buildingData: Pick<Building, 'name' | 'address' | 'description'>) => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .insert([buildingData])
        .select()
        .single();

      if (error) throw error;
      
      setBuildings(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating building:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateBuilding = async (id: string, buildingData: Partial<Pick<Building, 'name' | 'address' | 'description'>>) => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .update(buildingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setBuildings(prev => prev.map(building => 
        building.id === id ? { ...building, ...data } : building
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating building:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBuildings(prev => prev.filter(building => building.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting building:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return {
    buildings,
    loading,
    error,
    refetch: fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
  };
};