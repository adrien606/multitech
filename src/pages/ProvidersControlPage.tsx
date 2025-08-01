import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Euro, TrendingUp, Activity } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';
import Navigation from '@/components/Navigation';

export default function ProvidersControlPage() {
  const { providers } = useProviders();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Prestataires</h2>
            <p className="text-muted-foreground mt-1">
              Performance et analyse des prestataires
            </p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prestataires actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers?.filter(p => p.is_active).length || 0}</div>
              <p className="text-xs text-muted-foreground">Sur {providers?.length || 0} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(providers?.reduce((total, p) => total + (p.total_amount || 0), 0) || 0).toLocaleString()} €
              </div>
              <p className="text-xs text-muted-foreground">Dépenses 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût moyen</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {providers && providers.length > 0 ? Math.round(
                  providers.reduce((sum, p) => sum + (p.average_cost || 0), 0) / 
                  (providers.filter(p => p.is_active).length || 1)
                ) : 0} €
              </div>
              <p className="text-xs text-muted-foreground">Par intervention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance des prestataires */}
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
                        <p className="text-sm text-muted-foreground">{provider.specialties}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{provider.total_interventions}</p>
                        <p className="text-muted-foreground">Interventions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{provider.total_amount?.toLocaleString()} €</p>
                        <p className="text-muted-foreground">Total dépensé</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{provider.average_cost} €</p>
                        <p className="text-muted-foreground">Coût moyen</p>
                      </div>
                      <Badge variant={provider.pending_controls! > 0 ? 'destructive' : 'default'}>
                        {provider.pending_controls} en cours
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analyse financière */}
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
                    {providers && providers.length > 0 ? Math.round(
                      providers.reduce((sum, p) => sum + (p.average_cost || 0), 0) / 
                      (providers.filter(p => p.is_active).length || 1)
                    ) : 0} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prestataire le plus cher</span>
                  <span className="font-medium text-red-600">
                    {providers && providers.length > 0 ? providers.reduce((max, p) => p.average_cost! > max.average_cost! ? p : max, providers[0])?.average_cost : 0} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prestataire le moins cher</span>
                  <span className="font-medium text-green-600">
                    {providers?.filter(p => p.is_active).length > 0 ? providers.filter(p => p.is_active).reduce((min, p) => p.average_cost! < min.average_cost! ? p : min, providers.filter(p => p.is_active)[0])?.average_cost : 0} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Économies potentielles</span>
                  <span className="font-medium text-blue-600">
                    {Math.round((providers?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0) * 0.12).toLocaleString()} €
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
      </div>
    </div>
  );
}