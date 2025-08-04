import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BuildingModal } from "@/components/BuildingModal";
import { BuildingDetailModal } from "@/components/BuildingDetailModal";
import { Plus, Edit, Trash2, MapPin, Building as BuildingIcon, ArrowLeft, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useBuildings, Building } from "@/hooks/useBuildings";
import { toast } from "sonner";

export default function BuildingsPage() {
  const { buildings, loading, createBuilding, updateBuilding, deleteBuilding, refetch } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [detailBuilding, setDetailBuilding] = useState<Building | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleCreateBuilding = () => {
    setSelectedBuilding(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewBuilding = (building: Building) => {
    setDetailBuilding(building);
    setIsDetailModalOpen(true);
  };

  const handleDeleteBuilding = async (building: Building) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le bâtiment "${building.name}" ?`)) {
      return;
    }

    const result = await deleteBuilding(building.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Bâtiment supprimé avec succès');
    }
  };

  const handleSaveBuilding = async (buildingData: Pick<Building, 'name' | 'address' | 'description' | 'client_billing_enabled'>) => {
    try {
      let result;
      
      if (modalMode === 'create') {
        result = await createBuilding(buildingData);
      } else if (selectedBuilding) {
        result = await updateBuilding(selectedBuilding.id, buildingData);
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(modalMode === 'create' ? 'Bâtiment créé avec succès' : 'Bâtiment modifié avec succès');
      refetch(); // Force refresh
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving building:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement des bâtiments...</p>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-foreground">Gestion des Bâtiments</h1>
                <p className="text-muted-foreground mt-1">
                  Gérer les bâtiments et leurs informations
                </p>
              </div>
            </div>
            <Button onClick={handleCreateBuilding}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bâtiment
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total bâtiments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BuildingIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-2xl font-bold">{buildings.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des bâtiments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="w-5 h-5" />
              Bâtiments ({buildings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {buildings.length > 0 ? (
              <div className="space-y-4">
                {buildings.map((building) => (
                  <Card key={building.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{building.name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{building.address}</span>
                          </div>
                          {building.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {building.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Refacturation client:</span>
                              <Switch
                                checked={building.client_billing_enabled}
                                onCheckedChange={async (enabled) => {
                                  const result = await updateBuilding(building.id, { 
                                    client_billing_enabled: enabled 
                                  });
                                  if (result?.error) {
                                    toast.error(result.error);
                                  } else {
                                    toast.success(`Refacturation client ${enabled ? 'activée' : 'désactivée'}`);
                                    refetch();
                                  }
                                }}
                              />
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                building.client_billing_enabled 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {building.client_billing_enabled ? 'Activée' : 'Désactivée'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBuilding(building)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir détails
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBuilding(building)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBuilding(building)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        Créé le {format(new Date(building.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BuildingIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucun bâtiment enregistré</p>
                <p className="text-sm">Commencez par ajouter votre premier bâtiment.</p>
                <Button onClick={handleCreateBuilding} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un bâtiment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <BuildingModal
        building={selectedBuilding}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBuilding}
        mode={modalMode}
      />
      
      <BuildingDetailModal
        building={detailBuilding}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        clientBilling={detailBuilding?.client_billing_enabled || false}
        onBillingChange={async (buildingId, enabled) => {
          const result = await updateBuilding(buildingId, { 
            client_billing_enabled: enabled 
          });
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success('Refacturation client mise à jour');
            // Mettre à jour detailBuilding avec la nouvelle valeur
            if (detailBuilding) {
              setDetailBuilding({
                ...detailBuilding,
                client_billing_enabled: enabled
              });
            }
            refetch(); // Force refresh after billing change
          }
        }}
      />
    </div>
  );
}