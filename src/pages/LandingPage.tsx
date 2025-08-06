import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench, CheckCircle, Users, Building, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">YVES - MultiTech</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plateforme unifiée de gestion technique du bâtiment
          </p>
          
          {/* Process Steps */}
          <div className="bg-card rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Comment utiliser nos applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Identifiez votre besoin</h3>
                <p className="text-sm text-muted-foreground">
                  Maintenance préventive/curative ou contrôles réglementaires obligatoires
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Choisissez l'application</h3>
                <p className="text-sm text-muted-foreground">
                  Maintenance pour les tâches ou Facility Manager pour la conformité
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Gérez efficacement</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez, planifiez et documentez toutes vos interventions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* App Maintenance */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <Wrench className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Application Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Gestion complète des tâches d'entretien et de maintenance
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Planification des interventions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Gestion des équipes techniques</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Suivi par bâtiment et équipement</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">
                    Accéder à Maintenance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Facility Manager */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-400 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Facility Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Contrôles réglementaires et conformité obligatoire
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Contrôles périodiques obligatoires</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Gestion documentaire complète</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Conformité réglementaire assurée</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <Link to="/regulatory-controls">
                    Accéder à Facility Manager
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Info */}
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Besoin d'aide ?</strong> Chaque application dispose de son propre système d'authentification et de gestion des utilisateurs.
            Contactez votre administrateur pour obtenir vos accès.
          </p>
        </div>
      </div>
    </div>
  );
}