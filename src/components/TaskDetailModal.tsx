import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, User, MessageSquare, Camera, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onStatusChange }: TaskDetailModalProps) {
  if (!task) return null;

  const isOverdue = new Date() > task.dueDate && task.status !== 'validated';

  const handleGeneratePDF = () => {
    // TODO: Implémenter génération PDF
    console.log("Génération PDF pour:", task.title);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
              <TaskStatusBadge status={task.status} />
            </div>
            <Button variant="outline" onClick={handleGeneratePDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Bâtiment:</span>
                <span>{task.buildingName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Assigné à:</span>
                <span>{task.assignedTo}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Échéance:</span>
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  {format(task.dueDate, 'dd/MM/yyyy', { locale: fr })}
                  {isOverdue && ' (En retard)'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Créée le:</span>
                <span>{format(task.createdAt, 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {task.description}
            </p>
          </div>

          {/* Photos */}
          {task.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photos ({task.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {task.photos.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {photo.filename}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo de preuve */}
          {task.proofPhoto && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo de validation
              </h3>
              <img
                src={task.proofPhoto}
                alt="Photo de validation"
                className="w-48 h-32 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Commentaires */}
          {task.comments.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaires ({task.comments.length})
              </h3>
              <div className="space-y-3">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {comment.type === 'assignment' && 'Attribution'}
                          {comment.type === 'progress' && 'Progression'}
                          {comment.type === 'clarification' && 'Clarification'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {task.status === 'pending' && (
              <Button onClick={() => onStatusChange(task.id, 'progress')}>
                Commencer la tâche
              </Button>
            )}
            
            {task.status === 'progress' && (
              <Button onClick={() => onStatusChange(task.id, 'validated')}>
                Marquer comme validée
              </Button>
            )}
            
            <Button variant="outline">
              Ajouter un commentaire
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}