import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench, Building2, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">MultiTech</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Système de gestion intégré pour la maintenance et les contrôles réglementaires
          </p>
        </div>

        {/* Applications disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* App Maintenance */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                Application Maintenance
              </CardTitle>
              <CardDescription>
                Gestion des tâches d'entretien et maintenance des bâtiments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">• Suivi des tâches par bâtiment</p>
                <p className="text-sm text-muted-foreground">• Assignation aux agents</p>
                <p className="text-sm text-muted-foreground">• Photos et commentaires</p>
                <p className="text-sm text-muted-foreground">• Validation des interventions</p>
              </div>
              <Button asChild className="w-full">
                <Link to="/auth">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Accéder (Connexion requise)
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* App Facility Manager */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-600" />
                Facility Manager
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">NOUVEAU</span>
              </CardTitle>
              <CardDescription>
                Gestion centralisée des contrôles réglementaires et prestataires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">• Timeline des contrôles réglementaires</p>
                <p className="text-sm text-muted-foreground">• Gestion des prestataires</p>
                <p className="text-sm text-muted-foreground">• Dashboard centralisé</p>
                <p className="text-sm text-muted-foreground">• Stockage documentaire</p>
                <p className="text-sm text-muted-foreground">• Alertes et rappels</p>
              </div>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link to="/regulatory-controls">
                  <Building2 className="w-4 h-4 mr-2" />
                  Accéder à l'interface FM
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Deux interfaces complémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Application Maintenance</strong> : Pour les équipes terrain (agents, superviseurs) 
                gérant les tâches quotidiennes d'entretien.
              </p>
              <br />
              <p className="text-muted-foreground">
                <strong>Facility Manager</strong> : Interface dédiée aux responsables de site 
                pour le suivi des contrôles réglementaires obligatoires et la gestion des prestataires.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}