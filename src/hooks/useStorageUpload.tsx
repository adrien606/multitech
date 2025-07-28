import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  filename: string;
}

export const useStorageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string): Promise<UploadResult> => {
    setUploading(true);
    
    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading file to bucket:', bucket, 'with name:', fileName);
      
      // Upload le fichier vers le bucket Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Obtenir l'URL publique du fichier
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrlData.publicUrl);

      return {
        url: publicUrlData.publicUrl,
        filename: file.name
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[], bucket: string): Promise<UploadResult[]> => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadFile(file, bucket));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Erreur lors de l\'upload multiple:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading
  };
};