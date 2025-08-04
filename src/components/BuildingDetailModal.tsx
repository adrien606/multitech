import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Calendar, CheckCircle, AlertTriangle, Clock, Zap } from "lucide-react";
import { Building } from "@/hooks/useBuildings";
import { useRegulatoryControls } from "@/hooks/useRegulatoryControls";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

interface BuildingDetailModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  clientBilling: boolean;
  onBillingChange: (buildingId: string, billing: boolean) => void;
}

export function BuildingDetailModal({ building, isOpen, onClose, clientBilling, onBillingChange }: BuildingDetailModalProps) {
  const { controls } = useRegulatoryControls();
  
  if (!building) return null;

  // Filtrer les contrôles pour ce bâtiment
  const buildingControls = controls.filter(control => control.building_id === building.id);
  
  // Grouper les contrôles par année
  const controlsByYear = buildingControls.reduce((groups, control) => {
    const year = new Date(control.due_date).getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(control);
    return groups;
  }, {} as Record<number, typeof buildingControls>);
  
  // Trier les années (plus récentes en premier)
  const sortedYears = Object.keys(controlsByYear)
    .map(Number)
    .sort((a, b) => b - a);

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

  const handleBillingToggle = async (newValue: boolean) => {
    await onBillingChange(building.id, newValue);
  };

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Créé le {format(new Date(building.created_at), 'dd/MM/yyyy', { locale: fr })}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Refacturation client:</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={clientBilling}
                      onCheckedChange={handleBillingToggle}
                    />
                    <Badge variant={clientBilling ? "default" : "outline"} className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {clientBilling ? "Activée" : "Désactivée"}
                    </Badge>
                  </div>
                </div>
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
              <div className="space-y-6">
                {buildingControls.length > 0 ? sortedYears.map((year) => (
                  <div key={year} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{year}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({controlsByYear[year].length} contrôle{controlsByYear[year].length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {controlsByYear[year]
                        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                        .map((control) => (
                        <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg ml-4">
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
                      ))}
                    </div>
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