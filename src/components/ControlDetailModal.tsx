import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  X,
  Upload,
  FileText,
  Download,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRegulatoryControls } from "@/hooks/useRegulatoryControls";
import { useProviders } from "@/hooks/useProviders";
import { useBuildings } from "@/hooks/useBuildings";
import { useToast } from "@/hooks/use-toast";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { supabase } from "@/integrations/supabase/client";

interface ControlDetailModalProps {
  controlId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ControlDetailModal({ controlId, isOpen, onClose }: ControlDetailModalProps) {
  const { controls, updateControl, deleteControl, createControl } = useRegulatoryControls();
  const { providers } = useProviders();
  const { buildings } = useBuildings();
  const { toast } = useToast();
  const { uploadFile, uploading } = useStorageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState<Array<{
    id: string;
    filename: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
    status: string;
  }>>([]);
  const [editData, setEditData] = useState({
    building_id: '',
    building_name: '',
    assigned_provider_id: '',
    provider_name: '',
    due_date: '',
    next_due_date: '',
    notes: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue'
  });
  const [hasChanges, setHasChanges] = useState(false);
  
  const control = controls?.find(c => c.id === controlId);
  
  // Initialiser les données d'édition et charger les documents quand le contrôle change
  useEffect(() => {
    if (control) {
      setEditData({
        building_id: control.building_id || '',
        building_name: control.building_name || '',
        assigned_provider_id: control.assigned_provider_id || '',
        provider_name: control.provider_name || '',
        due_date: control.due_date || '',
        next_due_date: control.next_due_date || '',
        notes: control.notes || '',
        status: control.status
      });
      setHasChanges(false);
      
      // Charger les documents associés au contrôle
      loadDocuments();
    }
  }, [control]);

  const loadDocuments = async () => {
    if (!control) return;
    
    try {
      const { data, error } = await supabase
        .from('control_documents')
        .select('*')
        .eq('regulatory_control_id', control.id);
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  };

  // Early return APRÈS tous les hooks
  if (!control) return null;

  const isOverdue = new Date() > new Date(control.due_date) && control.status !== 'completed';

  // Fonction pour détecter les changements
  const handleFieldChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

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
      building_id: control.building_id || '',
      building_name: control.building_name || '',
      assigned_provider_id: control.assigned_provider_id || '',
      provider_name: control.provider_name || '',
      due_date: control.due_date || '',
      next_due_date: control.next_due_date || '',
      notes: control.notes || '',
      status: control.status
    });
    setHasChanges(false);
  };

  const handleSave = async () => {
    try {
      // Vérifier si la date de prochaine échéance a changé
      const originalNextDueDate = control.next_due_date;
      const newNextDueDate = editData.next_due_date;
      const shouldCreateNextControl = newNextDueDate && newNextDueDate !== originalNextDueDate;
      
      const { error } = await updateControl(controlId, editData);
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      // Si une nouvelle date de prochaine échéance a été définie, créer un nouveau contrôle
      if (shouldCreateNextControl) {
        const nextControlData = {
          building_id: editData.building_id,
          control_type_id: control.control_type_id,
          due_date: editData.next_due_date,
          assigned_provider_id: editData.assigned_provider_id || null,
          notes: `Contrôle automatiquement créé à partir du contrôle du ${format(new Date(control.due_date), 'dd/MM/yyyy', { locale: fr })}`
        };
        
        const { error: createError } = await createControl(nextControlData);
        if (createError) {
          toast({
            title: "Avertissement",
            description: "Contrôle mis à jour mais erreur lors de la création du contrôle suivant: " + createError,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Succès",
            description: "Contrôle mis à jour et nouveau contrôle créé pour la prochaine échéance",
          });
        }
      } else {
        toast({
          title: "Succès",
          description: "Contrôle mis à jour avec succès",
        });
      }
      
      setHasChanges(false);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${control.id}/${fileName}`;

      // Upload vers le bucket control-documents
      const { error: uploadError } = await supabase.storage
        .from('control-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Enregistrer les métadonnées dans la table control_documents
      const { data, error: dbError } = await supabase
        .from('control_documents')
        .insert({
          regulatory_control_id: control.id,
          filename: fileName,
          original_filename: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Recharger la liste des documents
      await loadDocuments();
      
      toast({
        title: "Succès",
        description: "Document uploadé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload du document",
        variant: "destructive",
      });
    }
  };

  const getDocumentType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc':
      case 'docx': return 'Word';
      case 'xls':
      case 'xlsx': return 'Excel';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'Image';
      default: return 'Autre';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;

      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from('control-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Erreur lors de la suppression du fichier:', storageError);
      }

      // Supprimer l'enregistrement de la base de données
      const { error: dbError } = await supabase
        .from('control_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        throw dbError;
      }

      // Recharger la liste des documents
      await loadDocuments();
      
      toast({
        title: "Succès",
        description: "Document supprimé",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await deleteControl(controlId);
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
        description: "Contrôle supprimé avec succès",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
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
              <DialogDescription className="sr-only">
                Détails du contrôle réglementaire {control.control_type_name}
              </DialogDescription>
              <Badge variant={control.status === 'completed' ? 'default' : 'secondary'} className="mb-4">
                {getStatusIcon(editData.status)}
                <span className="ml-1">{getStatusText(editData.status)}</span>
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
                <div className="flex-1">
                  <Select
                    value={editData.building_id}
                    onValueChange={(value) => {
                      const building = buildings?.find(b => b.id === value);
                      handleFieldChange('building_id', value);
                      handleFieldChange('building_name', building?.name || '');
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Sélectionner un bâtiment" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Prestataire:</span>
                <div className="flex-1">
                  <Select
                    value={editData.assigned_provider_id || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        handleFieldChange('assigned_provider_id', '');
                        handleFieldChange('provider_name', '');
                      } else {
                        const provider = providers?.find(p => p.id === value);
                        handleFieldChange('assigned_provider_id', value);
                        handleFieldChange('provider_name', provider?.name || '');
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Sélectionner un prestataire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun prestataire</SelectItem>
                      {providers?.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Échéance:</span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={editData.due_date ? editData.due_date.split('T')[0] : ''}
                    onChange={(e) => handleFieldChange('due_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className={`h-8 ${isOverdue ? 'border-destructive' : ''}`}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Prochaine échéance:</span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={editData.next_due_date ? editData.next_due_date.split('T')[0] : ''}
                    onChange={(e) => handleFieldChange('next_due_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Créé le:</span>
                <span>{format(new Date(control.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div>
            <h3 className="font-medium mb-2">Statut</h3>
            <Select
              value={editData.status}
              onValueChange={(value) => handleFieldChange('status', value as 'pending' | 'in_progress' | 'completed' | 'overdue')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    En attente
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    En cours
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Terminé
                  </div>
                </SelectItem>
                <SelectItem value="overdue">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    En retard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-medium mb-2">Notes</h3>
            <Textarea
              value={editData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Ajouter des notes..."
              className="min-h-[80px]"
            />
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Documents</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? 'Upload...' : 'Ajouter'}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDocumentType(doc.filename)} • {formatFileSize(doc.file_size)} • 
                          {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase.storage
                              .from('control-documents')
                              .createSignedUrl(doc.file_path, 3600);
                            
                            if (error) throw error;
                            window.open(data.signedUrl, '_blank');
                          } catch (error) {
                            toast({
                              title: "Erreur",
                              description: "Impossible d'ouvrir le document",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun document attaché</p>
            )}
          </div>

          {/* Informations de création et modification */}
          <div className="bg-muted/20 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Historique</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Créé le:</span>
                <span className="font-medium">
                  {format(new Date(control.created_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                </span>
                {control.created_by_name && (
                  <>
                    <span className="text-muted-foreground">par</span>
                    <span className="font-medium">{control.created_by_name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Modifié le:</span>
                <span className="font-medium">
                  {format(new Date(control.updated_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                </span>
                {control.updated_by_name && (
                  <>
                    <span className="text-muted-foreground">par</span>
                    <span className="font-medium">{control.updated_by_name}</span>
                  </>
                )}
              </div>
            </div>
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
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Modifications non sauvegardées
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive hover:border-destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le contrôle</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer ce contrôle <strong>{control.control_type_name}</strong> ?
                      Cette action est irréversible et supprimera toutes les données associées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              {hasChanges && (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Enregistrer
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}