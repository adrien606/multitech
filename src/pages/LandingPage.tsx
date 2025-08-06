import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench, Users, FileText, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">MultiTech</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plateforme unifiée de gestion technique et réglementaire pour votre entreprise
          </p>
        </div>

        {/* Process Overview */}
        <div className="bg-card rounded-lg p-8 border">
          <h2 className="text-2xl font-semibold text-center mb-8">Processus d'utilisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold">Identification du besoin</h3>
              <p className="text-sm text-muted-foreground">
                Déterminez si votre tâche concerne la maintenance technique ou les contrôles réglementaires
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold">Sélection de l'application</h3>
              <p className="text-sm text-muted-foreground">
                Choisissez l'interface appropriée selon votre profil et votre mission
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold">Exécution</h3>
              <p className="text-sm text-muted-foreground">
                Réalisez vos tâches avec les outils adaptés à votre domaine d'intervention
              </p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* App Maintenance */}
          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Application Maintenance</CardTitle>
                  <p className="text-muted-foreground">Interface technique opérationnelle</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Pour qui :</span>
                  <span className="text-sm text-muted-foreground">Techniciens, agents de maintenance</span>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-medium">Fonctionnalités :</span>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Gestion des tâches d'entretien</li>
                      <li>• Suivi des interventions</li>
                      <li>• Planning de maintenance</li>
                      <li>• Rapports techniques</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Utilisation :</span>
                  <span className="text-sm text-muted-foreground">Quotidienne pour les interventions terrain</span>
                </div>
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/auth" className="flex items-center justify-center gap-2">
                  Accéder à Maintenance
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* App Facility Manager */}
          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Facility Manager</CardTitle>
                  <p className="text-muted-foreground">Interface de gestion réglementaire</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Pour qui :</span>
                  <span className="text-sm text-muted-foreground">Responsables, facility managers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-medium">Fonctionnalités :</span>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Contrôles réglementaires</li>
                      <li>• Gestion des bâtiments</li>
                      <li>• Suivi des prestataires</li>
                      <li>• Documentation officielle</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Utilisation :</span>
                  <span className="text-sm text-muted-foreground">Planification et supervision</span>
                </div>
              </div>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link to="/regulatory-controls" className="flex items-center justify-center gap-2">
                  Accéder à Facility Manager
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Besoin d'aide ?</h3>
          <p className="text-muted-foreground text-sm">
            Si vous hésitez sur l'application à utiliser, contactez votre responsable ou consultez la documentation interne.
          </p>
        </div>
      </div>
    </div>
  );
}