import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
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

  const createProvider = async (provider: Omit<Provider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .insert([provider])
        .select()
        .single();

      if (error) throw error;

      setProviders(prev => [...prev, data]);
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

  const updateProvider = async (id: string, updates: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProviders(prev => prev.map(p => p.id === id ? data : p));
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