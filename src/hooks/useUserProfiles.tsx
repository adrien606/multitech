import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'supervisor' | 'agent';
}

export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données pour inclure le rôle directement
      const profilesWithRoles = data?.map((profile: any) => ({
        ...profile,
        role: profile.user_roles?.[0]?.role || 'agent'
      })) || [];

      setProfiles(profilesWithRoles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
  };
};