import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Plus,
  Calendar,
  Euro
} from 'lucide-react';
import { useBuildings } from '@/hooks/useBuildings';
import { useRegulatoryControls } from '@/hooks/useRegulatoryControls';
import { useProviders } from '@/hooks/useProviders';
import { FilterControls } from '@/components/FilterControls';
import { NewControlModal } from '@/components/NewControlModal';
import { ControlDetailModal } from '@/components/ControlDetailModal';
import { ControlsCalendar } from '@/components/ControlsCalendar';
import Navigation from '@/components/Navigation';

export default function ControlsPage() {
  const { buildings } = useBuildings();
  const { controls, stats, createControl } = useRegulatoryControls();
  const { providers } = useProviders();
  
  // États pour les filtres
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('all');
  
  // État pour les modales
  const [isNewControlModalOpen, setIsNewControlModalOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  // Filtrage des contrôles
  const filteredControls = controls?.filter((control) => {
    const matchesBuilding = selectedBuilding === 'all' || control.building_id === selectedBuilding;
    const matchesStatus = selectedStatus === 'all' || control.status === selectedStatus;
    
    // Filtrage par échéance
    const controlDate = new Date(control.due_date);
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    const oneQuarterFromNow = new Date();
    oneQuarterFromNow.setMonth(now.getMonth() + 3);

    let matchesDueDate = true;
    if (selectedDueDate === 'week') {
      matchesDueDate = controlDate >= now && controlDate <= oneWeekFromNow;
    } else if (selectedDueDate === 'month') {
      matchesDueDate = controlDate >= now && controlDate <= oneMonthFromNow;
    } else if (selectedDueDate === 'quarter') {
      matchesDueDate = controlDate >= now && controlDate <= oneQuarterFromNow;
    } else if (selectedDueDate === 'overdue') {
      matchesDueDate = controlDate < now && control.status !== 'completed';
    }
    
    return matchesBuilding && matchesStatus && matchesDueDate;
  }) || [];

  // Gestionnaire pour créer un nouveau contrôle
  const handleCreateControl = async (controlData: any) => {
    try {
      const { data, error } = await createControl(controlData);
      if (error) {
        console.error('Erreur lors de la création du contrôle:', error);
        return;
      }
      console.log('Contrôle créé avec succès:', data);
    } catch (error) {
      console.error('Erreur lors de la création du contrôle:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'overdue': return 'En retard';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header avec statistiques */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Contrôles</h2>
            <p className="text-muted-foreground mt-1">
              Suivi et planification des contrôles réglementaires
            </p>
          </div>
          <Button onClick={() => setIsNewControlModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau contrôle
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contrôles à venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcoming || 0}</div>
              <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.overdue || 0}</div>
              <p className="text-xs text-muted-foreground">Nécessite une attention immédiate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés ce mois</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              <p className="text-xs text-muted-foreground">Taux de completion: 85%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                0 €
              </div>
              <p className="text-xs text-muted-foreground">Dépenses prestataires 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendrier des contrôles */}
        <div className="mb-8">
          <ControlsCalendar controls={controls || []} />
        </div>

        {/* Filtres */}
        <FilterControls
          buildings={buildings || []}
          selectedBuilding={selectedBuilding}
          selectedStatus={selectedStatus}
          selectedDueDate={selectedDueDate}
          onBuildingChange={setSelectedBuilding}
          onStatusChange={setSelectedStatus}
          onDueDateChange={setSelectedDueDate}
          onClearFilters={() => {
            setSelectedBuilding('all');
            setSelectedStatus('all');
            setSelectedDueDate('all');
          }}
          controlsCount={filteredControls.length}
          totalControls={controls?.length || 0}
        />

        {/* Liste des contrôles */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des contrôles</CardTitle>
            <CardDescription>
              {filteredControls.length} contrôle(s) affiché(s) sur {controls?.length || 0} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredControls.length > 0 ? (
                filteredControls.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(control.status)}`} />
                      <div>
                        <p className="font-medium">{control.control_type_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {control.building_name} • Échéance: {new Date(control.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={control.status === 'completed' ? 'default' : 'secondary'}>
                        {getStatusIcon(control.status)}
                        {getStatusText(control.status)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedControlId(control.id)}
                      >
                        Détails
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun contrôle trouvé avec les filtres sélectionnés.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedBuilding('all');
                      setSelectedStatus('all');
                      setSelectedDueDate('all');
                    }}
                  >
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modale de création */}
        <NewControlModal
          isOpen={isNewControlModalOpen}
          onClose={() => setIsNewControlModalOpen(false)}
          onControlCreate={handleCreateControl}
          buildings={buildings || []}
          providers={providers || []}
        />

        {/* Modale de détails */}
        {selectedControlId && (
          <ControlDetailModal
            controlId={selectedControlId}
            isOpen={!!selectedControlId}
            onClose={() => setSelectedControlId(null)}
          />
        )}
      </div>
    </div>
  );
}