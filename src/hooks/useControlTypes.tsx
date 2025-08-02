import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ControlType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useControlTypes() {
  const [controlTypes, setControlTypes] = useState<ControlType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchControlTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('control_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setControlTypes(data || []);
    } catch (error) {
      console.error('Error fetching control types:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de contrôles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createControlType = async (controlType: Omit<ControlType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('control_types')
        .insert([controlType])
        .select()
        .single();

      if (error) throw error;

      setControlTypes(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Type de contrôle créé avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error creating control type:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de contrôle",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateControlType = async (id: string, updates: Partial<Omit<ControlType, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('control_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setControlTypes(prev => prev.map(ct => ct.id === id ? data : ct));
      toast({
        title: "Succès",
        description: "Type de contrôle mis à jour avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error updating control type:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de contrôle",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteControlType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('control_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setControlTypes(prev => prev.filter(ct => ct.id !== id));
      toast({
        title: "Succès",
        description: "Type de contrôle supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting control type:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de contrôle",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchControlTypes();
  }, []);

  return {
    controlTypes,
    loading,
    createControlType,
    updateControlType,
    deleteControlType,
    refetch: fetchControlTypes,
  };
}