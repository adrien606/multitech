import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Calendar, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Building } from "@/hooks/useBuildings";
import { useRegulatoryControls } from "@/hooks/useRegulatoryControls";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BuildingDetailModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuildingDetailModal({ building, isOpen, onClose }: BuildingDetailModalProps) {
  const { controls } = useRegulatoryControls();
  
  if (!building) return null;

  // Filtrer les contrôles pour ce bâtiment
  const buildingControls = controls.filter(control => control.building_id === building.id);

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

  const activeControls = buildingControls.filter(c => c.status !== 'completed').length;
  const overdueControls = buildingControls.filter(c => c.status === 'overdue').length;
  const completedThisMonth = buildingControls.filter(c => c.status === 'completed').length;

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
                {buildingControls.length > 0 ? buildingControls.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{control.control_type_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Échéance: {format(new Date(control.due_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                      {control.provider_name && (
                        <p className="text-xs text-muted-foreground">
                          Prestataire: {control.provider_name}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(control.status)}>
                      {getStatusIcon(control.status)}
                      {getStatusText(control.status)}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Aucun contrôle associé à ce bâtiment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}