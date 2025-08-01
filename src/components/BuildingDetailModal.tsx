import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Calendar, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Building } from "@/hooks/useBuildings";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BuildingDetailModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuildingDetailModal({ building, isOpen, onClose }: BuildingDetailModalProps) {
  if (!building) return null;

  // Mock data pour les contrôles - à remplacer par de vraies données
  const mockControls = [
    { id: 1, title: "Contrôle extinction", status: "completed", dueDate: "2024-01-15" },
    { id: 2, title: "Vérification alarme", status: "pending", dueDate: "2024-02-01" },
    { id: 3, title: "Inspection électrique", status: "overdue", dueDate: "2024-01-20" },
    { id: 4, title: "Contrôle chauffage", status: "in_progress", dueDate: "2024-02-05" },
    { id: 5, title: "Test évacuation", status: "completed", dueDate: "2024-01-10" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'overdue': return 'destructive';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const activeControls = mockControls.filter(c => c.status !== 'completed').length;
  const overdueControls = mockControls.filter(c => c.status === 'overdue').length;
  const completedThisMonth = mockControls.filter(c => c.status === 'completed').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Détails du bâtiment - {building.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{building.address}</span>
              </div>
              {building.description && (
                <p className="text-muted-foreground">{building.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Créé le {format(new Date(building.created_at), 'dd/MM/yyyy', { locale: fr })}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques des contrôles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contrôles actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeControls}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En retard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{overdueControls}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Terminés ce mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedThisMonth}</div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des contrôles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contrôles associés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockControls.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{control.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Échéance: {format(new Date(control.dueDate), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(control.status)}>
                      {getStatusIcon(control.status)}
                      {getStatusText(control.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}