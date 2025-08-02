import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  is_active: boolean;
  building_id: string | null;
  created_at: string;
  updated_at: string;
  building?: {
    id: string;
    name: string;
    address: string;
  };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          name,
          email,
          phone,
          description,
          is_active,
          created_at,
          updated_at,
          provider_specialities(
            id,
            speciality:specialities(*)
          )
        `)
        .order('name');

      if (error) throw error;
      
      // Map the data to match our Provider interface
      const mappedProviders = (data || []).map(provider => ({
        ...provider,
        building_id: null, // For now, until migration is applied
        building: undefined
      }));
      
      setProviders(mappedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les prestataires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProvider = async (provider: Omit<Provider, 'id' | 'created_at' | 'updated_at'>, specialityIds: string[] = []) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .insert([provider])
        .select()
        .single();

      if (error) throw error;

      // Ajouter les spécialités si fournies
      if (specialityIds.length > 0) {
        const specialityInserts = specialityIds.map(specialityId => ({
          provider_id: data.id,
          speciality_id: specialityId,
        }));

        const { error: specialityError } = await supabase
          .from('provider_specialities')
          .insert(specialityInserts);

        if (specialityError) {
          console.error('Error adding specialities:', specialityError);
        }
      }

      // Recharger les données pour inclure les spécialités
      await fetchProviders();
      
      toast({
        title: "Succès",
        description: "Prestataire créé avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le prestataire",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProvider = async (id: string, updates: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>, specialityIds?: string[]) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour les spécialités si fournies
      if (specialityIds !== undefined) {
        // Supprimer les anciennes spécialités
        await supabase
          .from('provider_specialities')
          .delete()
          .eq('provider_id', id);

        // Ajouter les nouvelles spécialités
        if (specialityIds.length > 0) {
          const specialityInserts = specialityIds.map(specialityId => ({
            provider_id: id,
            speciality_id: specialityId,
          }));

          const { error: specialityError } = await supabase
            .from('provider_specialities')
            .insert(specialityInserts);

          if (specialityError) {
            console.error('Error updating specialities:', specialityError);
          }
        }
      }

      // Recharger les données pour inclure les spécialités
      await fetchProviders();
      
      toast({
        title: "Succès",
        description: "Prestataire mis à jour avec succès",
      });
      return data;
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le prestataire",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProviders(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Succès",
        description: "Prestataire supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le prestataire",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    createProvider,
    updateProvider,
    deleteProvider,
    refetch: fetchProviders,
  };
}