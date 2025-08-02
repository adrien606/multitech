import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RegulatoryControl {
  id: string;
  building_id: string;
  building_name: string;
  control_type_id: string;
  control_type_name: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigned_provider_id?: string;
  provider_name?: string;
  notes?: string;
  completed_date?: string;
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  upcoming: number;
}

export const useRegulatoryControls = () => {
  const [controls, setControls] = useState<RegulatoryControl[]>([]);
  const [stats, setStats] = useState<ControlStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données depuis localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('regulatory_controls');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Sauvegarder dans localStorage
  const saveToStorage = (controlsData: RegulatoryControl[]) => {
    try {
      localStorage.setItem('regulatory_controls', JSON.stringify(controlsData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const fetchControls = async () => {
    try {
      setLoading(true);
      
      // Récupérer les contrôles depuis Supabase avec les informations des bâtiments et types de contrôles
      const { data: controlsData, error } = await supabase
        .from('regulatory_controls')
        .select(`
          *,
          buildings (
            name
          ),
          control_types (
            name
          ),
          providers (
            name
          )
        `)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Transformer les données pour correspondre à l'interface
      const transformedControls: RegulatoryControl[] = (controlsData || []).map(control => ({
        id: control.id,
        building_id: control.building_id,
        building_name: control.buildings?.name || 'Bâtiment inconnu',
        control_type_id: control.control_type_id,
        control_type_name: control.control_types?.name || 'Type inconnu',
        due_date: control.due_date,
        status: control.status as any,
        assigned_provider_id: control.assigned_provider_id,
        provider_name: control.providers?.name,
        notes: control.notes,
        completed_date: control.completed_date,
        next_due_date: control.next_due_date,
        created_at: control.created_at,
        updated_at: control.updated_at,
      }));

      setControls(transformedControls);

      // Calculer les statistiques
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);

      const calculatedStats: ControlStats = {
        total: transformedControls.length,
        pending: transformedControls.filter(c => c.status === 'pending').length,
        in_progress: transformedControls.filter(c => c.status === 'in_progress').length,
        completed: transformedControls.filter(c => c.status === 'completed').length,
        overdue: transformedControls.filter(c => 
          c.status !== 'completed' && new Date(c.due_date) < now
        ).length,
        upcoming: transformedControls.filter(c => 
          c.status !== 'completed' && 
          new Date(c.due_date) >= now && 
          new Date(c.due_date) <= oneWeekFromNow
        ).length,
      };

      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching regulatory controls:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des contrôles');
    } finally {
      setLoading(false);
    }
  };

  const createControl = async (controlData: Partial<RegulatoryControl>) => {
    try {
      const { data, error } = await supabase
        .from('regulatory_controls')
        .insert({
          building_id: controlData.building_id,
          control_type_id: controlData.control_type_id,
          due_date: controlData.due_date,
          status: controlData.status || 'pending',
          assigned_provider_id: controlData.assigned_provider_id,
          notes: controlData.notes,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Rafraîchir les données
      await fetchControls();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error creating regulatory control:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateControl = async (id: string, controlData: Partial<RegulatoryControl>) => {
    try {
      const { data, error } = await supabase
        .from('regulatory_controls')
        .update({
          status: controlData.status,
          notes: controlData.notes,
          completed_date: controlData.completed_date,
          next_due_date: controlData.next_due_date,
          assigned_provider_id: controlData.assigned_provider_id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Rafraîchir les données
      await fetchControls();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating regulatory control:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteControl = async (id: string) => {
    try {
      const { error } = await supabase
        .from('regulatory_controls')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Rafraîchir les données
      await fetchControls();
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting regulatory control:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  return {
    controls,
    stats,
    loading,
    error,
    refetch: fetchControls,
    createControl,
    updateControl,
    deleteControl,
  };
};