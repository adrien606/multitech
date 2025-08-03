import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ControlDocument {
  id: string;
  regulatory_control_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'validated' | 'rejected';
  uploaded_by?: string;
  validated_by?: string;
  validated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Informations jointes
  building_id?: string;
  building_name?: string;
  control_type_id?: string;
  control_type_name?: string;
  provider_id?: string;
  provider_name?: string;
}

export interface ControlDocumentStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  totalSize: number;
}

export const useControlDocuments = () => {
  const [documents, setDocuments] = useState<ControlDocument[]>([]);
  const [stats, setStats] = useState<ControlDocumentStats>({
    total: 0,
    pending: 0,
    validated: 0,
    rejected: 0,
    totalSize: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (documentsData: ControlDocument[]): ControlDocumentStats => {
    return {
      total: documentsData.length,
      pending: documentsData.filter(d => d.status === 'pending').length,
      validated: documentsData.filter(d => d.status === 'validated').length,
      rejected: documentsData.filter(d => d.status === 'rejected').length,
      totalSize: documentsData.reduce((sum, doc) => sum + doc.file_size, 0),
    };
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: documentsData, error: documentsError } = await supabase
        .from('control_documents')
        .select(`
          *,
          regulatory_controls(
            building_id,
            control_type_id,
            assigned_provider_id,
            buildings(name),
            control_types(name),
            providers(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      const transformedDocuments: ControlDocument[] = (documentsData || []).map(doc => ({
        id: doc.id,
        regulatory_control_id: doc.regulatory_control_id,
        filename: doc.filename,
        original_filename: doc.original_filename,
        file_path: doc.file_path,
        file_size: doc.file_size,
        file_type: doc.file_type,
        status: doc.status as 'pending' | 'validated' | 'rejected',
        uploaded_by: doc.uploaded_by,
        validated_by: doc.validated_by,
        validated_at: doc.validated_at,
        notes: doc.notes,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        building_id: (doc.regulatory_controls as any)?.building_id || '',
        building_name: (doc.regulatory_controls as any)?.buildings?.name || '',
        control_type_id: (doc.regulatory_controls as any)?.control_type_id || '',
        control_type_name: (doc.regulatory_controls as any)?.control_types?.name || '',
        provider_id: (doc.regulatory_controls as any)?.assigned_provider_id || '',
        provider_name: (doc.regulatory_controls as any)?.providers?.name || '',
      }));

      setDocuments(transformedDocuments);
      setStats(calculateStats(transformedDocuments));

      return { data: transformedDocuments, error: null };
    } catch (err) {
      console.error('Error fetching control documents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (id: string, status: 'pending' | 'validated' | 'rejected', notes?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) updateData.notes = notes;
      if (status === 'validated') {
        updateData.validated_by = (await supabase.auth.getUser()).data.user?.id;
        updateData.validated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('control_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recharger la liste
      await fetchDocuments();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating document status:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    try {
      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from('control-documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continuer même si la suppression du fichier échoue
      }

      // Supprimer l'enregistrement de la base de données
      const { error: dbError } = await supabase
        .from('control_documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      // Recharger la liste
      await fetchDocuments();
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting document:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    stats,
    loading,
    error,
    refetch: fetchDocuments,
    updateDocumentStatus,
    deleteDocument,
    formatFileSize,
  };
};