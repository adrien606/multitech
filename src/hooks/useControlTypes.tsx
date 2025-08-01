import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ControlType {
  id: string;
  name: string;
  description?: string;
  recurrence_months: number;
  average_cost?: number;
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
      // Mock data pour le moment
      const mockData: ControlType[] = [
        {
          id: '1',
          name: 'Contrôle électrique',
          description: 'Vérification annuelle des installations électriques',
          recurrence_months: 12,
          average_cost: 150,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Contrôle de chauffage',
          description: 'Maintenance préventive des systèmes de chauffage',
          recurrence_months: 12,
          average_cost: 200,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setControlTypes(mockData);
    } catch (err) {
      console.error('Error fetching control types:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createControlType = async (controlTypeData: Omit<ControlType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newControlType: ControlType = {
        ...controlTypeData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setControlTypes(prev => [...prev, newControlType]);
      toast({
        title: "Type de contrôle créé",
        description: "Le nouveau type de contrôle a été ajouté avec succès.",
      });
      
      return newControlType;
    } catch (err) {
      console.error('Error creating control type:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de contrôle.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateControlType = async (id: string, controlTypeData: Partial<Omit<ControlType, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setControlTypes(prev => prev.map(ct => 
        ct.id === id 
          ? { ...ct, ...controlTypeData, updated_at: new Date().toISOString() }
          : ct
      ));
      
      toast({
        title: "Type de contrôle modifié",
        description: "Le type de contrôle a été mis à jour avec succès.",
      });
      
      return controlTypeData;
    } catch (err) {
      console.error('Error updating control type:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le type de contrôle.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteControlType = async (id: string) => {
    try {
      setControlTypes(prev => prev.filter(ct => ct.id !== id));
      toast({
        title: "Type de contrôle supprimé",
        description: "Le type de contrôle a été désactivé avec succès.",
      });
    } catch (err) {
      console.error('Error deleting control type:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de contrôle.",
        variant: "destructive",
      });
      throw err;
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