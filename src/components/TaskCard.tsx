import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, MessageSquare, Camera, Eye, User, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status'], comment?: string) => void;
  onViewDetails: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onViewDetails, onDelete }: TaskCardProps) {
  const isOverdue = new Date() > task.dueDate && task.status !== 'validated' && task.status !== 'validation_requested';

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-destructive/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground mb-1 break-words">{task.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{task.buildingName}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{task.assignedTo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className={isOverdue ? 'text-destructive' : ''}>
                  {format(task.dueDate, 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            {(task as any).priority === 1 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </Badge>
            )}
            {(task as any).priority === 2 && (
              <Badge variant="secondary">Normale</Badge>
            )}
            {(task as any).priority === 3 && (
              <Badge variant="outline">Basse</Badge>
            )}
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.photos.length > 0 && (
              <div className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{task.photos.length}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(task)}
              className="flex-1 sm:flex-initial"
            >
              <Eye className="w-3 h-3 mr-1" />
              Voir
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:border-destructive p-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la tâche</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer la tâche "{task.title}" ?
                    Cette action est irréversible et supprimera également toutes les photos et commentaires associés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {task.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(task.id, 'progress')}
                className="flex-1 sm:flex-initial"
              >
                Commencer
              </Button>
            )}
            
            {task.status === 'progress' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange(task.id, 'validation_requested')}
                className="flex-1 sm:flex-initial"
              >
                Demander validation
              </Button>
            )}

            {task.status === 'validation_requested' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStatusChange(task.id, 'validated')}
                className="flex-1 sm:flex-initial"
              >
                Valider
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}