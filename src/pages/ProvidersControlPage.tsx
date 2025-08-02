import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Edit, Trash2, Phone, Mail, Settings, Building2 } from 'lucide-react';
import { useProviders, Provider } from '@/hooks/useProviders';
import { ProviderModal } from '@/components/ProviderModal';
import { ProviderDeleteDialog } from '@/components/ProviderDeleteDialog';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

export default function ProvidersControlPage() {
  const navigate = useNavigate();
  const { providers, loading, createProvider, updateProvider, deleteProvider } = useProviders();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedProvider(null);
    setModalOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  const handleDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (providerData: Omit<Provider, 'id' | 'created_at' | 'updated_at'>, specialityIds: string[], buildingIds: string[]) => {
    setActionLoading(true);
    try {
      if (selectedProvider) {
        await updateProvider(selectedProvider.id, providerData, specialityIds, buildingIds);
      } else {
        await createProvider(providerData, specialityIds, buildingIds);
      }
      
      setModalOpen(false);
      setSelectedProvider(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProvider) return;
    
    setActionLoading(true);
    try {
      await deleteProvider(selectedProvider.id);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Chargement des prestataires...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Prestataires</h2>
            <p className="text-muted-foreground mt-1">
              Gérez vos prestataires de services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/regulatory-controls/specialities')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gérer les spécialités
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau prestataire
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prestataires actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.filter(p => p.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Sur {providers.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prestataires inactifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.filter(p => !p.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Prestataires désactivés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.length}</div>
              <p className="text-xs text-muted-foreground">Tous prestataires</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des prestataires */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des prestataires</CardTitle>
            <CardDescription>Gérez vos prestataires de services</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Bâtiment</TableHead>
                  <TableHead>Spécialités</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {provider.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {provider.email}
                          </div>
                        )}
                        {provider.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {provider.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.buildings && provider.buildings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {provider.buildings.slice(0, 2).map((building) => (
                            <Badge key={building.id} variant="secondary" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {building.name}
                            </Badge>
                          ))}
                          {provider.buildings.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.buildings.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(provider as any).provider_specialities?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(provider as any).provider_specialities.slice(0, 2).map((ps: any) => (
                            <Badge key={ps.id} variant="outline" className="text-xs">
                              {ps.speciality.name}
                            </Badge>
                          ))}
                          {(provider as any).provider_specialities.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(provider as any).provider_specialities.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucune</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                        {provider.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(provider)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(provider)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {providers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun prestataire trouvé. Commencez par en ajouter un.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ProviderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        provider={selectedProvider}
        onSave={handleSave}
        isLoading={actionLoading}
      />

      <ProviderDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        provider={selectedProvider}
        onConfirm={handleConfirmDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}