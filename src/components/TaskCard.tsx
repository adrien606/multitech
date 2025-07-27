import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, MessageSquare, Camera, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onViewDetails: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onViewDetails }: TaskCardProps) {
  const isOverdue = new Date() > task.dueDate && task.status !== 'validated';

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-destructive/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-1">{task.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{task.buildingName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className={isOverdue ? 'text-destructive' : ''}>
                  {format(task.dueDate, 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex items-center justify-between">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(task)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Voir
            </Button>
            
            {task.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(task.id, 'progress')}
              >
                Commencer
              </Button>
            )}
            
            {task.status === 'progress' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange(task.id, 'validated')}
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