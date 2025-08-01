import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';

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

  const fetchControls = async () => {
    try {
      setLoading(true);
      
      // Données mock pour le développement
      const mockControls: RegulatoryControl[] = [
        {
          id: '1',
          building_id: '1',
          building_name: 'Tour Montparnasse',
          control_type_id: '1',
          control_type_name: 'Vérification périodique ascenseurs',
          due_date: '2024-03-15',
          status: 'pending',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          building_id: '2',
          building_name: 'Immeuble Haussmann',
          control_type_id: '2',
          control_type_name: 'Contrôle incendie annuel',
          due_date: '2024-02-20',
          status: 'overdue',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '3',
          building_id: '1',
          building_name: 'Tour Montparnasse',
          control_type_id: '3',
          control_type_name: 'Vérification électrique',
          due_date: '2024-04-10',
          status: 'in_progress',
          provider_name: 'Électricité Plus',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      setControls(mockControls);

      // Calculer les statistiques
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);

      const calculatedStats: ControlStats = {
        total: mockControls.length,
        pending: mockControls.filter(c => c.status === 'pending').length,
        in_progress: mockControls.filter(c => c.status === 'in_progress').length,
        completed: mockControls.filter(c => c.status === 'completed').length,
        overdue: mockControls.filter(c => 
          c.status !== 'completed' && new Date(c.due_date) < now
        ).length,
        upcoming: mockControls.filter(c => 
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
      // Mock pour le développement
      const newControl: RegulatoryControl = {
        id: Math.random().toString(),
        building_id: controlData.building_id || '',
        building_name: controlData.building_name || '',
        control_type_id: controlData.control_type_id || '',
        control_type_name: controlData.control_type_name || '',
        due_date: controlData.due_date || '',
        status: controlData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setControls(prev => [newControl, ...prev]);
      return { data: newControl, error: null };
    } catch (err) {
      console.error('Error creating regulatory control:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateControl = async (id: string, controlData: Partial<RegulatoryControl>) => {
    try {
      setControls(prev => prev.map(control => 
        control.id === id ? { ...control, ...controlData, updated_at: new Date().toISOString() } : control
      ));
      return { data: controlData, error: null };
    } catch (err) {
      console.error('Error updating regulatory control:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteControl = async (id: string) => {
    try {
      setControls(prev => prev.filter(control => control.id !== id));
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