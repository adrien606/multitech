import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, MessageSquare, Camera, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status'], comment?: string) => void;
  onViewDetails: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onViewDetails }: TaskCardProps) {
  const isOverdue = new Date() > task.dueDate && task.status !== 'validated';

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
          <div className="flex-shrink-0">
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