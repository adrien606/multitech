import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  specialties: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // Données mock pour le développement
      const mockProviders: Provider[] = [
        {
          id: '1',
          name: 'Électricité Plus',
          email: 'contact@electricite-plus.fr',
          phone: '01 23 45 67 89',
          address: '123 Rue de la Paix, 75001 Paris',
          specialties: 'Électricité, Éclairage, Maintenance préventive',
          is_active: true,
          notes: 'Prestataire de confiance, interventions rapides',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Sécurité Incendie Pro',
          email: 'info@securite-incendie.com',
          phone: '01 98 76 54 32',
          address: '456 Avenue des Champs, 75008 Paris',
          specialties: 'Contrôles incendie, Extincteurs, Alarmes',
          is_active: true,
          notes: 'Spécialiste agréé, certifications à jour',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '3',
          name: 'Ascenseurs Excellence',
          email: 'service@ascenseurs-excellence.fr',
          phone: '01 11 22 33 44',
          address: '789 Boulevard Haussmann, 75009 Paris',
          specialties: 'Ascenseurs, Monte-charges, Escalators',
          is_active: false,
          notes: 'Contrat suspendu - recherche nouvel prestataire',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      setProviders(mockProviders);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des prestataires');
    } finally {
      setLoading(false);
    }
  };

  const createProvider = async (providerData: Omit<Provider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProvider: Provider = {
        ...providerData,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setProviders(prev => [newProvider, ...prev]);
      return { data: newProvider, error: null };
    } catch (err) {
      console.error('Error creating provider:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateProvider = async (id: string, providerData: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setProviders(prev => prev.map(provider => 
        provider.id === id ? { ...provider, ...providerData, updated_at: new Date().toISOString() } : provider
      ));
      return { data: providerData, error: null };
    } catch (err) {
      console.error('Error updating provider:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      setProviders(prev => prev.filter(provider => provider.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting provider:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    refetch: fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
  };
};