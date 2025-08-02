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

export interface ProviderSpeciality {
  id: string;
  provider_id: string;
  speciality_id: string;
  created_at: string;
  speciality: Speciality;
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
        .eq('is_active', true)
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

  const getProviderSpecialities = async (providerId: string) => {
    try {
      const { data, error } = await supabase
        .from('provider_specialities')
        .select(`
          id,
          provider_id,
          speciality_id,
          created_at,
          speciality:specialities(*)
        `)
        .eq('provider_id', providerId);

      if (error) throw error;
      return data as ProviderSpeciality[];
    } catch (error) {
      console.error('Error fetching provider specialities:', error);
      return [];
    }
  };

  const updateProviderSpecialities = async (providerId: string, specialityIds: string[]) => {
    try {
      // Delete existing specialities for this provider
      await supabase
        .from('provider_specialities')
        .delete()
        .eq('provider_id', providerId);

      // Insert new specialities
      if (specialityIds.length > 0) {
        const insertData = specialityIds.map(specialityId => ({
          provider_id: providerId,
          speciality_id: specialityId,
        }));

        const { error } = await supabase
          .from('provider_specialities')
          .insert(insertData);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Spécialités du prestataire mises à jour",
      });
    } catch (error) {
      console.error('Error updating provider specialities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les spécialités",
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
    getProviderSpecialities,
    updateProviderSpecialities,
    refetch: fetchSpecialities,
  };
}