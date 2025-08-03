import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Zap, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMeters } from '@/hooks/useMeters';
import { useBuildings } from '@/hooks/useBuildings';

const MetersPage = () => {
  const { meters, loading, deleteMeter } = useMeters();
  const { buildings } = useBuildings();
  const { toast } = useToast();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');

  // Filter buildings that have client_billing = true
  const billingBuildings = buildings.filter((building: any) => building.client_billing);
  
  // Filter meters based on selected building
  const filteredMeters = selectedBuildingId 
    ? meters.filter(meter => meter.building_id === selectedBuildingId)
    : meters.filter(meter => billingBuildings.some((building: any) => building.id === meter.building_id));

  const handleDeleteMeter = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compteur ?')) {
      const { error } = await deleteMeter(id);
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Succès',
          description: 'Compteur supprimé avec succès',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Compteurs Électriques</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des compteurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Compteurs Électriques</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un compteur
          </Button>
        </div>

        {/* Building Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrer par bâtiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedBuildingId === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBuildingId('')}
              >
                Tous les bâtiments avec refacturation
              </Button>
              {billingBuildings.map((building: any) => (
                <Button
                  key={building.id}
                  variant={selectedBuildingId === building.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBuildingId(building.id)}
                >
                  {building.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des compteurs</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMeters.length}</div>
            <p className="text-xs text-muted-foreground">
              {billingBuildings.length} bâtiment(s) avec refacturation client
            </p>
          </CardContent>
        </Card>

        {/* Meters List */}
        {filteredMeters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun compteur trouvé</h3>
              <p className="text-muted-foreground mb-6">
                {billingBuildings.length === 0 
                  ? "Aucun bâtiment n'a la refacturation client activée."
                  : "Commencez par ajouter des compteurs pour les bâtiments sélectionnés."
                }
              </p>
              {billingBuildings.length > 0 && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier compteur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredMeters.map((meter) => (
              <Card key={meter.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Compteur {meter.meter_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meter.buildings?.name} - {meter.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={meter.is_active ? 'default' : 'secondary'}>
                        {meter.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">{meter.meter_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Adresse: {meter.buildings?.address}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les relevés
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMeter(meter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetersPage;