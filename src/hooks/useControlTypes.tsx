import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ControlType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useControlTypes = () => {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControlTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('control_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setControlTypes(data || []);
    } catch (err) {
      console.error('Error fetching control types:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des types de contrôle');
    } finally {
      setLoading(false);
    }
  };

  const createControlType = async (typeData: { name: string; description?: string }) => {
    try {
      const { data, error } = await supabase
        .from('control_types')
        .insert([typeData])
        .select()
        .single();

      if (error) throw error;
      
      setControlTypes(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating control type:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateControlType = async (id: string, typeData: Partial<ControlType>) => {
    try {
      const { data, error } = await supabase
        .from('control_types')
        .update(typeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setControlTypes(prev => prev.map(type => 
        type.id === id ? { ...type, ...data } : type
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating control type:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteControlType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('control_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setControlTypes(prev => prev.filter(type => type.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting control type:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchControlTypes();
  }, []);

  return {
    controlTypes,
    loading,
    error,
    refetch: fetchControlTypes,
    createControlType,
    updateControlType,
    deleteControlType,
  };
};