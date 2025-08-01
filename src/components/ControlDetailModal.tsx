import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Repeat,
  Edit,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRegulatoryControls } from "@/hooks/useRegulatoryControls";
import { useProviders } from "@/hooks/useProviders";
import { useToast } from "@/hooks/use-toast";

interface ControlDetailModalProps {
  controlId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ControlDetailModal({ controlId, isOpen, onClose }: ControlDetailModalProps) {
  const { controls, updateControl } = useRegulatoryControls();
  const { providers } = useProviders();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    assigned_provider_id: '',
    provider_name: '',
    next_due_date: '',
    notes: ''
  });
  
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

  const handleEdit = () => {
    setEditData({
      assigned_provider_id: control.assigned_provider_id || '',
      provider_name: control.provider_name || '',
      next_due_date: control.next_due_date || '',
      notes: control.notes || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await updateControl(controlId, editData);
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Succès",
        description: "Contrôle mis à jour avec succès",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      const completedData = {
        status: 'completed' as const,
        completed_date: new Date().toISOString()
      };
      
      const { error } = await updateControl(controlId, completedData);
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Succès",
        description: "Contrôle marqué comme terminé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
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
            {!isEditing && control.status !== 'completed' && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            )}
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
                {isEditing ? (
                  <div className="flex-1">
                    <Select
                      value={editData.assigned_provider_id}
                      onValueChange={(value) => {
                        const provider = providers?.find(p => p.id === value);
                        setEditData(prev => ({
                          ...prev,
                          assigned_provider_id: value,
                          provider_name: provider?.name || ''
                        }));
                      }}
                    >
                      <SelectTrigger className="h-7">
                        <SelectValue placeholder="Sélectionner un prestataire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun prestataire</SelectItem>
                        {providers?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span>{control.provider_name || 'Non assigné'}</span>
                )}
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
                {isEditing ? (
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={editData.next_due_date ? editData.next_due_date.split('T')[0] : ''}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        next_due_date: e.target.value ? new Date(e.target.value).toISOString() : ''
                      }))}
                      className="h-7"
                    />
                  </div>
                ) : (
                  <span>
                    {control.next_due_date 
                      ? format(new Date(control.next_due_date), 'dd/MM/yyyy', { locale: fr })
                      : 'Non programmée'
                    }
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Créé le:</span>
                <span>{format(new Date(control.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-medium mb-2">Notes</h3>
            {isEditing ? (
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajouter des notes..."
                className="min-h-[80px]"
              />
            ) : control.notes ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {control.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune note</p>
            )}
          </div>

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
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
                {control.status !== 'completed' && (
                  <Button onClick={handleComplete}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marquer comme terminé
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}