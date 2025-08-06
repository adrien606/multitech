import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProviderContract {
  id: string;
  provider_id: string;
  provider_name: string;
  file_path: string;
  original_filename: string;
  filename: string;
  file_type: string;
  file_size: number;
  notes?: string;
  status: 'active' | 'expired' | 'archived';
  uploaded_by?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderContractStats {
  total: number;
  active: number;
  expired: number;
  archived: number;
  totalFileSize: number;
}

export const useProviderContracts = () => {
  const [contracts, setContracts] = useState<ProviderContract[]>([]);
  const [stats, setStats] = useState<ProviderContractStats>({
    total: 0,
    active: 0,
    expired: 0,
    archived: 0,
    totalFileSize: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('provider_contracts')
        .select(`
          *,
          providers!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedContracts: ProviderContract[] = (data || []).map(contract => ({
        id: contract.id,
        provider_id: contract.provider_id,
        provider_name: (contract.providers as any)?.name || '',
        file_path: contract.file_path,
        original_filename: contract.original_filename,
        filename: contract.filename,
        file_type: contract.file_type,
        file_size: contract.file_size,
        notes: contract.notes,
        status: contract.status,
        uploaded_by: contract.uploaded_by,
        uploaded_at: contract.created_at,
        created_at: contract.created_at,
        updated_at: contract.updated_at,
      }));

      setContracts(transformedContracts);
      setStats(calculateStats(transformedContracts));
      setError(null);
    } catch (error) {
      console.error('Error fetching provider contracts:', error);
      setError('Erreur lors du chargement des contrats');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contracts: ProviderContract[]): ProviderContractStats => {
    return contracts.reduce((acc, contract) => {
      acc.total++;
      acc[contract.status]++;
      acc.totalFileSize += contract.file_size;
      return acc;
    }, {
      total: 0,
      active: 0,
      expired: 0,
      archived: 0,
      totalFileSize: 0
    });
  };

  const updateContractStatus = async (id: string, status: 'active' | 'expired' | 'archived', notes?: string) => {
    try {
      const { error } = await (supabase as any)
        .from('provider_contracts')
        .update({ 
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: "Le statut du contrat a été mis à jour avec succès",
      });

      await fetchContracts();
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du contrat",
        variant: "destructive",
      });
    }
  };

  const deleteContract = async (id: string, filePath: string) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('control-documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('provider_contracts')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Contrat supprimé",
        description: "Le contrat a été supprimé avec succès",
      });

      await fetchContracts();
      return { error: null };
    } catch (error) {
      console.error('Error deleting contract:', error);
      return { error: 'Erreur lors de la suppression du contrat' };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const refetch = fetchContracts;

  return {
    contracts,
    stats,
    loading,
    error,
    refetch,
    updateContractStatus,
    deleteContract,
    formatFileSize
  };
};