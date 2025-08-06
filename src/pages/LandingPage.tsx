import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">MultiTech</h1>
          <p className="text-muted-foreground">
            Choisissez votre interface de travail
          </p>
        </div>

        {/* Applications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* App Maintenance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Wrench className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gestion des tâches d'entretien
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">
                  Accéder
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* App Facility Manager */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-green-500">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Facility Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Contrôles réglementaires
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link to="/regulatory-controls">
                  Accéder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}