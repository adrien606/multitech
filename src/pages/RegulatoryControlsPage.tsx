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
  Filter
} from 'lucide-react';
import { useBuildings } from '@/hooks/useBuildings';
import { useRegulatoryControls } from '@/hooks/useRegulatoryControls';
import { useProviders } from '@/hooks/useProviders';

export default function RegulatoryControlsPage() {
  const { buildings } = useBuildings();
  const { controls, stats } = useRegulatoryControls();
  const { providers } = useProviders();
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

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
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contrôle
            </Button>
          </div>
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
              <CardTitle className="text-sm font-medium">Bâtiments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buildings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Sites sous contrôle</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="controls">Contrôles</TabsTrigger>
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
                      <Badge variant="secondary">{stats?.pending || 0}</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En cours</span>
                      <Badge variant="default">{stats?.in_progress || 0}</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Terminés</span>
                      <Badge variant="outline" className="text-green-600">{stats?.completed || 0}</Badge>
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
                <CardDescription>Tous les contrôles réglementaires par bâtiment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {controls?.map((control) => (
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
                        <Button variant="ghost" size="sm">Détails</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Prestataires</CardTitle>
                <CardDescription>Gestion des entreprises de contrôle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers?.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {provider.email} • {provider.phone}
                          </p>
                          <p className="text-xs text-muted-foreground">{provider.specialties}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                          {provider.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}