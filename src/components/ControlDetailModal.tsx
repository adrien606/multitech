import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Repeat
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRegulatoryControls } from "@/hooks/useRegulatoryControls";

interface ControlDetailModalProps {
  controlId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ControlDetailModal({ controlId, isOpen, onClose }: ControlDetailModalProps) {
  const { controls } = useRegulatoryControls();
  
  const control = controls?.find(c => c.id === controlId);
  
  if (!control) return null;

  const isOverdue = new Date() > new Date(control.due_date) && control.status !== 'completed';

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'overdue': return 'En retard';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto mx-4">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{control.control_type_name}</DialogTitle>
              <Badge variant={control.status === 'completed' ? 'default' : 'secondary'} className="mb-4">
                {getStatusIcon(control.status)}
                <span className="ml-1">{getStatusText(control.status)}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Bâtiment:</span>
                <span>{control.building_name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Prestataire:</span>
                <span>{control.provider_name || 'Non assigné'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Échéance:</span>
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  {format(new Date(control.due_date), 'dd/MM/yyyy', { locale: fr })}
                  {isOverdue && ' (En retard)'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Prochaine échéance:</span>
                <span>
                  {control.next_due_date 
                    ? format(new Date(control.next_due_date), 'dd/MM/yyyy', { locale: fr })
                    : 'Non programmée'
                  }
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Créé le:</span>
                <span>{format(new Date(control.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {control.notes && (
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {control.notes}
              </p>
            </div>
          )}

          {/* Statut et informations supplémentaires */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(control.status)}`} />
              <span className="font-medium">Statut: {getStatusText(control.status)}</span>
            </div>
            
            {control.status === 'completed' && (
              <p className="text-sm text-green-600">
                ✓ Contrôle terminé avec succès
              </p>
            )}
            
            {control.status === 'overdue' && (
              <p className="text-sm text-red-600">
                ⚠️ Ce contrôle est en retard et nécessite une attention immédiate
              </p>
            )}
            
            {control.status === 'in_progress' && (
              <p className="text-sm text-blue-600">
                🔄 Contrôle en cours de réalisation
              </p>
            )}
            
            {control.status === 'pending' && (
              <p className="text-sm text-gray-600">
                ⏳ Contrôle en attente de réalisation
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            {control.status !== 'completed' && (
              <Button variant="default">
                Marquer comme terminé
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}