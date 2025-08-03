import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Settings, Zap } from 'lucide-react';
import { useBuildings, Building } from '@/hooks/useBuildings';
import Navigation from '@/components/Navigation';
import { BuildingDetailModal } from '@/components/BuildingDetailModal';
import { BuildingEditModal } from '@/components/BuildingEditModal';
import { toast } from "sonner";

export default function BuildingsControlPage() {
  const { buildings, updateBuilding } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleViewDetails = (building: Building) => {
    setSelectedBuilding(building);
    setIsDetailModalOpen(true);
  };

  const handleEditBilling = (building: Building) => {
    setSelectedBuilding(building);
    setIsEditModalOpen(true);
  };

  const handleSaveBilling = async (buildingId: string, clientBilling: boolean) => {
    try {
      // Pour l'instant, on simule la sauvegarde
      // Après Supabase : await updateBuilding(buildingId, { client_billing: clientBilling });
      console.log(`Building ${buildingId} client_billing set to ${clientBilling}`);
      toast.success("Paramètres de refacturation mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Bâtiments</h2>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble des sites et leurs contrôles associés
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings?.map((building) => (
            <Card key={building.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {building.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {building.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Contrôles actifs</span>
                    <Badge>5</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>En retard</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Terminés ce mois</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Refacturation client</span>
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Oui {/* Mock pour l'instant */}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails(building)}
                    >
                      Voir les détails
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditBilling(building)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurer refacturation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {buildings?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun bâtiment trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BuildingDetailModal
        building={selectedBuilding}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <BuildingEditModal
        building={selectedBuilding}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveBilling}
      />
    </div>
  );
}