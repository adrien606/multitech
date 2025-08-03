import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText,
  Calendar,
  Plus,
  Filter,
  Home,
  Euro,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBuildings } from '@/hooks/useBuildings';
import { useRegulatoryControls } from '@/hooks/useRegulatoryControls';
import { FilterControls } from '@/components/FilterControls';
import { NewControlModal } from '@/components/NewControlModal';
import { ControlDetailModal } from '@/components/ControlDetailModal';
import { useProviders } from '@/hooks/useProviders';
import { ControlsCalendar } from '@/components/ControlsCalendar';

export default function RegulatoryControlsPage() {
  const { buildings } = useBuildings();
  const { controls, stats, createControl } = useRegulatoryControls();
  const { providers } = useProviders();
  
  // États pour les filtres
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('all');
  
  // État pour la modale de création
  const [isNewControlModalOpen, setIsNewControlModalOpen] = useState(false);
  
  // État pour la modale de détails
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  // Filtrage des contrôles
  const filteredControls = controls?.filter((control) => {
    const matchesBuilding = selectedBuilding === 'all' || control.building_id === selectedBuilding;
    const matchesStatus = selectedStatus === 'all' || control.status === selectedStatus;
    
    // Filtrage par échéance
    const controlDate = new Date(control.due_date);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Filtrer par année en cours - par défaut, on ne montre que les contrôles de l'année en cours
    const isCurrentYear = controlDate.getFullYear() === currentYear;
    
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    const oneQuarterFromNow = new Date();
    oneQuarterFromNow.setMonth(now.getMonth() + 3);

    let matchesDueDate = true;
    if (selectedDueDate === 'week') {
      matchesDueDate = controlDate >= now && controlDate <= oneWeekFromNow && isCurrentYear;
    } else if (selectedDueDate === 'month') {
      matchesDueDate = controlDate >= now && controlDate <= oneMonthFromNow && isCurrentYear;
    } else if (selectedDueDate === 'quarter') {
      matchesDueDate = controlDate >= now && controlDate <= oneQuarterFromNow && isCurrentYear;
    } else if (selectedDueDate === 'overdue') {
      matchesDueDate = controlDate < now && control.status !== 'completed' && isCurrentYear;
    } else {
      // Pour 'all', on filtre quand même par année en cours
      matchesDueDate = isCurrentYear;
    }
    
    return matchesBuilding && matchesStatus && matchesDueDate;
  }) || [];

  // Calculer les statistiques à partir des contrôles filtrés
  const calculateFilteredStats = (controlsData: any[]) => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    const totalBudget = controlsData.reduce((sum, control) => {
      const cost = control.actual_cost || control.estimated_cost || 0;
      return sum + cost;
    }, 0);

    return {
      total: controlsData.length,
      pending: controlsData.filter(c => c.status === 'pending').length,
      in_progress: controlsData.filter(c => c.status === 'in_progress').length,
      completed: controlsData.filter(c => c.status === 'completed').length,
      overdue: controlsData.filter(c => 
        c.status !== 'completed' && new Date(c.due_date) < now
      ).length,
      upcoming: controlsData.filter(c => 
        c.status !== 'completed' && 
        new Date(c.due_date) >= now && 
        new Date(c.due_date) <= oneWeekFromNow
      ).length,
      total_budget: totalBudget,
    };
  };

  // Statistiques calculées à partir des contrôles filtrés
  const filteredStats = calculateFilteredStats(filteredControls);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contrôles Réglementaires</h1>
            <p className="text-muted-foreground mt-2">
              Gestion centralisée des contrôles par bâtiment
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button onClick={() => setIsNewControlModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contrôle
            </Button>
          </div>
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

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contrôles à venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats?.upcoming || 0}</div>
              <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{filteredStats?.overdue || 0}</div>
              <p className="text-xs text-muted-foreground">Nécessite une attention immédiate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés ce mois</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStats?.completed || 0}</div>
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
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(filteredStats?.total_budget || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Dépenses prestataires 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques Prestataires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance des prestataires</CardTitle>
              <CardDescription>Analyse des coûts et interventions par prestataire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers?.filter(p => p.is_active).map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.description || 'Aucune description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">0</p>
                        <p className="text-muted-foreground">Interventions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">0 €</p>
                        <p className="text-muted-foreground">Total dépensé</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">0 €</p>
                        <p className="text-muted-foreground">Coût moyen</p>
                      </div>
                      <Badge variant="default">
                        0 en cours
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analyse financière</CardTitle>
              <CardDescription>Répartition des coûts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Coût moyen/intervention</span>
                  <span className="font-medium">
                    0 €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prestataire le plus cher</span>
                  <span className="font-medium text-red-600">
                    0 €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prestataire le moins cher</span>
                  <span className="font-medium text-green-600">
                    0 €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Économies potentielles</span>
                  <span className="font-medium text-blue-600">
                    0 €
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8% d'économies avec optimisation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="controls">Contrôles</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="buildings">Bâtiments</TabsTrigger>
            <TabsTrigger value="providers">Prestataires</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contrôles par statut */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par statut</CardTitle>
                  <CardDescription>Vue d'ensemble des contrôles en cours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En attente</span>
                      <Badge variant="secondary">{filteredStats?.pending || 0}</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En cours</span>
                      <Badge variant="default">{filteredStats?.in_progress || 0}</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Terminés</span>
                      <Badge variant="outline" className="text-green-600">{filteredStats?.completed || 0}</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Bâtiments avec contrôles */}
              <Card>
                <CardHeader>
                  <CardTitle>Bâtiments prioritaires</CardTitle>
                  <CardDescription>Sites nécessitant une attention particulière</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {buildings?.slice(0, 5).map((building) => (
                      <div key={building.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{building.name}</p>
                            <p className="text-sm text-muted-foreground">{building.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">3 en retard</Badge>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
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
                            {control.status}
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
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ControlsCalendar 
              controls={controls || []} 
              buildings={buildings || []}
              onControlClick={(controlId) => setSelectedControlId(controlId)}
            />
          </TabsContent>

          <TabsContent value="buildings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildings?.map((building) => (
                <Card key={building.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {building.name}
                    </CardTitle>
                    <CardDescription>{building.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Contrôles actifs</span>
                        <Badge>5</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>En retard</span>
                        <Badge variant="destructive">2</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Prochain contrôle</span>
                        <span className="text-muted-foreground">15/02/2024</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Voir les contrôles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liste des prestataires */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Prestataires actifs</CardTitle>
                  <CardDescription>Gestion des entreprises de contrôle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {providers?.filter(p => p.is_active).map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <Users className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {provider.email} • {provider.phone}
                            </p>
                            <p className="text-xs text-muted-foreground">{provider.description || 'Aucune description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <p className="font-medium">0 €</p>
                            <p className="text-muted-foreground">0 interventions</p>
                          </div>
                          <Button variant="ghost" size="sm">Détails</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques financières */}
              <Card>
                <CardHeader>
                  <CardTitle>Synthèse financière</CardTitle>
                  <CardDescription>Vue d'ensemble des dépenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {providers?.filter(p => p.is_active).map((provider) => (
                      <div key={provider.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{provider.name}</span>
                          <span className="text-sm">{provider.name}</span>
                          <span className="text-sm">0 €</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `0%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total dépenses:</span>
                      <span className="font-medium">
                        0 €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Moyenne/prestataire:</span>
                      <span className="font-medium">
                        0 €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Stockage des rapports, contrats et devis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Aucun document</p>
                  <p className="text-muted-foreground mb-6">
                    Commencez par télécharger vos premiers documents de contrôle
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modale de création de contrôle */}
      <NewControlModal
        isOpen={isNewControlModalOpen}
        onClose={() => setIsNewControlModalOpen(false)}
        buildings={buildings || []}
        providers={providers || []}
        onControlCreate={handleCreateControl}
      />

      {/* Modale de détails de contrôle */}
      {selectedControlId && (
        <ControlDetailModal
          controlId={selectedControlId}
          isOpen={!!selectedControlId}
          onClose={() => setSelectedControlId(null)}
        />
      )}
    </div>
  );
}