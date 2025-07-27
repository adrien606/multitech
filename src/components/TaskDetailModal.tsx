import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Task, TaskComment } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, User, MessageSquare, Camera, Download, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onAddComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onStatusChange, onAddComment }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  if (!task) return null;

  const isOverdue = new Date() > task.dueDate && task.status !== 'validated';

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text('Rapport de Tâche de Maintenance', 20, 30);
    
    // Informations de base
    doc.setFontSize(12);
    doc.text(`Titre: ${task.title}`, 20, 50);
    doc.text(`Bâtiment: ${task.buildingName}`, 20, 60);
    doc.text(`Statut: ${task.status === 'pending' ? 'En attente' : task.status === 'progress' ? 'En cours' : 'Validée'}`, 20, 70);
    doc.text(`Assigné à: ${task.assignedTo}`, 20, 80);
    doc.text(`Échéance: ${format(task.dueDate, 'dd/MM/yyyy', { locale: fr })}`, 20, 90);
    
    // Description
    doc.text('Description:', 20, 110);
    const splitDescription = doc.splitTextToSize(task.description, 170);
    doc.text(splitDescription, 20, 120);
    
    // Commentaires
    if (task.comments.length > 0) {
      doc.text('Commentaires:', 20, 150);
      let yPos = 160;
      task.comments.forEach((comment, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        doc.text(`${comment.author} (${format(comment.createdAt, 'dd/MM/yyyy', { locale: fr })}):`, 20, yPos);
        const splitComment = doc.splitTextToSize(comment.text, 170);
        doc.text(splitComment, 20, yPos + 10);
        yPos += 30;
      });
    }
    
    doc.save(`tache_${task.id}_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(task.id, {
      text: newComment.trim(),
      author: "Agent Technique",
      type: "progress",
    });
    
    setNewComment("");
    setShowCommentForm(false);
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
          <div className="space-y-4 pt-4 border-t">
            {/* Changement de statut */}
            <div className="flex flex-wrap gap-2">
              {task.status === 'pending' && (
                <Button onClick={() => onStatusChange(task.id, 'progress')}>
                  Commencer la tâche
                </Button>
              )}
              
              {task.status === 'progress' && (
                <>
                  <Button onClick={() => onStatusChange(task.id, 'validated')}>
                    Marquer comme validée
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStatusChange(task.id, 'pending')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Remettre en attente
                  </Button>
                </>
              )}
              
              {task.status === 'validated' && (
                <Button 
                  variant="outline" 
                  onClick={() => onStatusChange(task.id, 'progress')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Remettre en cours
                </Button>
              )}
            </div>

            {/* Commentaires */}
            <div className="space-y-3">
              {!showCommentForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowCommentForm(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ajouter un commentaire
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                  <Textarea
                    placeholder="Votre commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCommentForm(false);
                        setNewComment("");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}