import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildingModal } from "@/components/BuildingModal";
import { Building } from "@/types";
import { mockBuildings } from "@/data/mockData";
import { Plus, Edit, Trash2, MapPin, Building as BuildingIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

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

  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bâtiment ? Toutes les tâches associées seront également supprimées.')) {
      setBuildings(buildings.filter(building => building.id !== buildingId));
    }
  };

  const handleSaveBuilding = (buildingData: Omit<Building, 'id' | 'createdAt'> | Building) => {
    if (modalMode === 'create') {
      const newBuilding: Building = {
        ...(buildingData as Omit<Building, 'id' | 'createdAt'>),
        id: `building_${Date.now()}`,
        createdAt: new Date(),
      };
      setBuildings([newBuilding, ...buildings]);
    } else {
      setBuildings(buildings.map(building => 
        building.id === (buildingData as Building).id ? (buildingData as Building) : building
      ));
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
                <h1 className="text-3xl font-bold text-foreground">Gestion des Bâtiments</h1>
                <p className="text-muted-foreground mt-1">
                  Ajouter, modifier ou supprimer des bâtiments
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ajoutés ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Plus className="w-4 h-4 text-accent" />
                </div>
                <span className="text-2xl font-bold">
                  {buildings.filter(b => 
                    new Date(b.createdAt).getMonth() === new Date().getMonth() &&
                    new Date(b.createdAt).getFullYear() === new Date().getFullYear()
                  ).length}
                </span>
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
                            <p className="text-sm text-muted-foreground">
                              {building.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
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
                            onClick={() => handleDeleteBuilding(building.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        Créé le {format(building.createdAt, 'dd/MM/yyyy', { locale: fr })}
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

      {/* Modal */}
      <BuildingModal
        building={selectedBuilding}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBuilding}
        mode={modalMode}
      />
    </div>
  );
}