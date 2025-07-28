import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Users, Calendar, Shield, UserCheck, UserX, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function UsersPage() {
  const { profiles, loading, refetch } = useUserProfiles();
  const { role } = useAuth();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const adminUsers = profiles.filter(profile => profile.role === 'admin');
  const supervisorUsers = profiles.filter(profile => profile.role === 'supervisor');
  const agentUsers = profiles.filter(profile => profile.role === 'agent');

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'supervisor': return 'default';
      case 'agent': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return UserCheck;
      case 'agent': return UserX;
      default: return Users;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'supervisor': return 'Superviseur';
      case 'agent': return 'Agent';
      default: return 'Utilisateur';
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      setDeletingUserId(userId);
      
      // Supprimer l'utilisateur de auth.users (cascade va supprimer profiles et user_roles)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast.success(`Utilisateur ${userName} supprimé avec succès`);
      refetch(); // Recharger la liste des utilisateurs
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Utilisateurs Inscrits</h1>
                <p className="text-muted-foreground mt-1">
                  Vue d'ensemble de tous les utilisateurs du système
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{adminUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Superviseurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{supervisorUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{agentUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tous les utilisateurs ({profiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : profiles.length > 0 ? (
              <div className="space-y-4">
                {profiles.map((profile) => {
                  const RoleIcon = getRoleIcon(profile.role);
                  return (
                    <Card key={profile.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <RoleIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-medium text-foreground">{profile.full_name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Inscrit le {format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(profile.role)}>
                              {getRoleLabel(profile.role)}
                            </Badge>
                            {role === 'admin' && profile.role !== 'admin' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:border-destructive"
                                    disabled={deletingUserId === profile.user_id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{profile.full_name}</strong> ?
                                      Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteUser(profile.user_id, profile.full_name)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun utilisateur trouvé.</p>
                <p className="text-sm mt-2">Les utilisateurs apparaîtront ici après leur inscription.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}