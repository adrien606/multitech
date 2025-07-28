import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, getRoleDisplayName } from '@/utils/userRole.utils';

export const useUserManagement = (refetch: () => void) => {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleChangeRole = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(`${userName} est maintenant ${getRoleDisplayName(newRole)}`);
      refetch();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      toast.error('Erreur lors du changement de rôle');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      setDeletingUserId(userId);
      
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast.success(`Utilisateur ${userName} supprimé avec succès`);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setDeletingUserId(null);
    }
  };

  return {
    deletingUserId,
    handleChangeRole,
    handleDeleteUser,
  };
};