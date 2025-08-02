import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RegulatoryControl, ControlStats } from '@/types/regulatory-controls';

export const useRegulatoryControls = () => {
  const [controls, setControls] = useState<RegulatoryControl[]>([]);
  const [stats, setStats] = useState<ControlStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (controlsData: RegulatoryControl[]): ControlStats => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    return {
      total: controlsData.length,
      pending: controlsData.filter(c => c.status === 'pending').length,
      in_progress: controlsData.filter(c => c.status === 'in_progress').length,
      completed: controlsData.filter(c => c.status === 'completed').length,
      overdue: controlsData.filter(c => 
        c.status !== 'completed' && new Date(c.due_date) < now
      ).length,
      upcoming: controlsData.filter(c => 
        c.status !== 'completed' && 
        new Date(c.due_date) >= now && 
        new Date(c.due_date) <= oneWeekFromNow
      ).length,
    };
  };

  const fetchControls = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les contrôles avec les informations des bâtiments, types de contrôles et prestataires
      const { data: controlsData, error: controlsError } = await supabase
        .from('regulatory_controls')
        .select(`
          *,
          buildings!regulatory_controls_building_id_fkey(name),
          control_types!regulatory_controls_control_type_id_fkey(name),
          providers!regulatory_controls_assigned_provider_id_fkey(name)
        `)
        .order('due_date', { ascending: true });

      if (controlsError) {
        throw controlsError;
      }

      // Transformer les données pour correspondre à l'interface
      const transformedControls: RegulatoryControl[] = (controlsData || []).map(control => ({
        id: control.id,
        building_id: control.building_id,
        building_name: control.buildings?.name || '',
        control_type_id: control.control_type_id,
        control_type_name: control.control_types?.name || '',
        due_date: control.due_date,
        assigned_provider_id: control.assigned_provider_id || '',
        provider_name: control.providers?.name || '',
        completed_date: control.completed_date || '',
        next_due_date: control.next_due_date || '',
        estimated_cost: control.estimated_cost || 0,
        actual_cost: control.actual_cost || 0,
        notes: control.notes || '',
        status: control.status as 'pending' | 'in_progress' | 'completed' | 'overdue',
        created_at: control.created_at,
        updated_at: control.updated_at,
      }));

      setControls(transformedControls);
      setStats(calculateStats(transformedControls));

      return { data: transformedControls, error: null };
    } catch (err) {
      console.error('Error fetching regulatory controls:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des contrôles';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createControl = async (controlData: Partial<RegulatoryControl>) => {
    try {
      const { data, error } = await supabase
        .from('regulatory_controls')
        .insert([{
          building_id: controlData.building_id,
          control_type_id: controlData.control_type_id,
          due_date: controlData.due_date,
          assigned_provider_id: controlData.assigned_provider_id || null,
          estimated_cost: controlData.estimated_cost || null,
          notes: controlData.notes || null,
          status: controlData.status || 'pending',
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recharger la liste pour avoir les données avec les jointures
      await fetchControls();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error creating regulatory control:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateControl = async (id: string, updates: Partial<RegulatoryControl>) => {
    try {
      const updateData: any = {};
      
      // Mapper les champs vers les colonnes de la base de données
      if (updates.building_id !== undefined) updateData.building_id = updates.building_id;
      if (updates.control_type_id !== undefined) updateData.control_type_id = updates.control_type_id;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.assigned_provider_id !== undefined) updateData.assigned_provider_id = updates.assigned_provider_id || null;
      if (updates.completed_date !== undefined) updateData.completed_date = updates.completed_date || null;
      if (updates.next_due_date !== undefined) updateData.next_due_date = updates.next_due_date || null;
      if (updates.estimated_cost !== undefined) updateData.estimated_cost = updates.estimated_cost;
      if (updates.actual_cost !== undefined) updateData.actual_cost = updates.actual_cost;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('regulatory_controls')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recharger la liste pour avoir les données à jour avec les jointures
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

      // Mettre à jour l'état local
      setControls(prev => {
        const filteredControls = prev.filter(control => control.id !== id);
        setStats(calculateStats(filteredControls));
        return filteredControls;
      });

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