import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Speciality {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSpecialities() {
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSpecialities = async () => {
    try {
      const { data, error } = await supabase
        .from('specialities')
        .select('*')
        .order('name');

      if (error) throw error;
      setSpecialities(data || []);
    } catch (error) {
      console.error('Error fetching specialities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les spécialités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSpeciality = async (speciality: Omit<Speciality, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('specialities')
        .insert([speciality])
        .select()
        .single();

      if (error) throw error;

      setSpecialities(prev => [...prev, data]);
      toast({
        title: "Succès",
        description: "Spécialité créée avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error creating speciality:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la spécialité",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSpeciality = async (id: string, updates: Partial<Omit<Speciality, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('specialities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSpecialities(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Succès",
        description: "Spécialité mise à jour avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error updating speciality:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la spécialité",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSpeciality = async (id: string) => {
    try {
      const { error } = await supabase
        .from('specialities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSpecialities(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Succès",
        description: "Spécialité supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting speciality:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la spécialité",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  return {
    specialities,
    loading,
    createSpeciality,
    updateSpeciality,
    deleteSpeciality,
    refetch: fetchSpecialities,
  };
}