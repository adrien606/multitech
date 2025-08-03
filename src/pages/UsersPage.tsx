import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserCard } from "@/components/users/UserCard";
import { UserStatsCard } from "@/components/users/UserStatsCard";
import { UserRole } from "@/utils/userRole.utils";

export default function UsersPage() {
  const { profiles, loading, refetch } = useUserProfiles();
  const { role, loading: authLoading } = useAuth();
  const { deletingUserId, handleChangeRole, handleDeleteUser } = useUserManagement(refetch);

  // Vérification que seuls les administrateurs peuvent accéder à cette page
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">Seuls les administrateurs peuvent accéder à cette page.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retourner au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminUsers = profiles.filter(profile => profile.role === 'admin');
  const supervisorUsers = profiles.filter(profile => profile.role === 'supervisor');
  const agentUsers = profiles.filter(profile => profile.role === 'agent');

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
          <UserStatsCard 
            title="Total utilisateurs" 
            value={profiles.length} 
          />
          <UserStatsCard 
            title="Administrateurs" 
            value={adminUsers.length} 
            variant="destructive" 
          />
          <UserStatsCard 
            title="Superviseurs" 
            value={supervisorUsers.length} 
            variant="primary" 
          />
          <UserStatsCard 
            title="Agents" 
            value={agentUsers.length} 
            variant="muted" 
          />
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
                {profiles.map((profile) => (
                  <UserCard
                    key={profile.id}
                    profile={profile}
                    currentUserRole={role as UserRole}
                    onRoleChange={handleChangeRole}
                    onDelete={handleDeleteUser}
                    isDeleting={deletingUserId === profile.user_id}
                  />
                ))}
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