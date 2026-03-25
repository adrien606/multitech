import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Task, TaskComment, TaskPhoto } from "@/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { Calendar, MapPin, User, MessageSquare, Camera, Download, Send, ArrowLeft, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';
import { useAuth } from "@/hooks/useAuth";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { getRoleLabel } from "@/utils/userRole.utils";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, status: Task['status'], comment?: string) => void;
  onAddComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>, photoFile?: File) => void;
  onAddPhotos?: (taskId: string, photos: Omit<TaskPhoto, 'id'>[], files: File[]) => void;
  onPriorityChange?: (taskId: string, priority: number) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onStatusChange, onAddComment, onAddPhotos, onPriorityChange }: TaskDetailModalProps) {
  const { profile, role } = useAuth();
  const { uploading } = useStorageUpload();
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const [commentPhotoPreview, setCommentPhotoPreview] = useState<string>("");
  
  if (!task) return null;

  const isOverdue = new Date() > task.dueDate && task.status !== 'validated' && task.status !== 'validation_requested';

  const handleGeneratePDF = async () => {
    const doc = new jsPDF();
    let yPos = 30;
    
    // En-tête
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT DE MAINTENANCE", 20, yPos);
    yPos += 20;
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    
    // Informations générales
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS GÉNÉRALES", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Titre de la tâche : ${task.title}`, 20, yPos);
    yPos += 7;
    doc.text(`Bâtiment : ${task.buildingName}`, 20, yPos);
    yPos += 7;
    doc.text(`Assigné à : ${task.assignedTo}`, 20, yPos);
    yPos += 7;
    doc.text(`Date d'échéance : ${format(task.dueDate, "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
    yPos += 7;
    doc.text(`Date de création : ${format(task.createdAt, "dd/MM/yyyy", { locale: fr })}`, 20, yPos);
    yPos += 7;
    
    // Statut avec couleur
    const statusText = task.status === "pending" ? "En attente" : 
                      task.status === "progress" ? "En cours" : 
                      task.status === "validation_requested" ? "Demande de validation" : "Validée";
    doc.text(`Statut : ${statusText}`, 20, yPos);
    yPos += 15;
    
    // Description
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(task.description, 170);
    doc.text(splitDescription, 20, yPos);
    yPos += (splitDescription.length * 5) + 10;
    
    // Photos
    if (task.photos.length > 0) {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > 200) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`PHOTOS (${task.photos.length})`, 20, yPos);
      yPos += 15;
      
      for (let i = 0; i < task.photos.length; i++) {
        const photo = task.photos[i];
        
        // Vérifier si on a besoin d'une nouvelle page
        if (yPos > 220) {
          doc.addPage();
          yPos = 30;
        }
        
        try {
          // Ajouter le nom du fichier
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`${i + 1}. ${photo.filename}`, 20, yPos);
          doc.text(`Ajoutée le : ${format(photo.uploadedAt, "dd/MM/yyyy HH:mm", { locale: fr })}`, 20, yPos + 5);
          yPos += 15;
          
          // Note: Dans un vrai projet, on chargerait l'image en base64
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text("[Photo disponible dans l'application]", 25, yPos);
          yPos += 20;
          
        } catch (error) {
          console.warn("Erreur lors de l'ajout de la photo:", error);
          doc.text(`[Photo non disponible: ${photo.filename}]`, 25, yPos);
          yPos += 10;
        }
      }
    }
    
    // Photo de preuve
    if (task.proofPhoto) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PHOTO DE VALIDATION", 20, yPos);
      yPos += 15;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("[Photo de validation disponible dans l'application]", 25, yPos);
      yPos += 20;
    }
    
    // Commentaires
    if (task.comments.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`HISTORIQUE DES COMMENTAIRES (${task.comments.length})`, 20, yPos);
      yPos += 15;
      
      task.comments.forEach((comment, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        
        // Type de commentaire
        const typeText = comment.type === "assignment" ? "Attribution" :
                        comment.type === "progress" ? "Progression" : "Clarification";
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${comment.author} - ${typeText}`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date : ${format(comment.createdAt, "dd/MM/yyyy HH:mm", { locale: fr })}`, 25, yPos);
        yPos += 7;
        
        const splitComment = doc.splitTextToSize(comment.text, 160);
        doc.text(splitComment, 25, yPos);
        yPos += (splitComment.length * 5) + 5;
        
        // Photo du commentaire si elle existe
        if (comment.photo) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text(`📷 Photo jointe : ${comment.photo.filename}`, 25, yPos);
          doc.text("[Photo disponible dans l'application]", 25, yPos + 5);
          yPos += 15;
        } else {
          yPos += 5;
        }
      });
    }
    
    // Pied de page sur toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 20, 285);
      doc.text(`Page ${i} sur ${pageCount}`, 170, 285);
    }
    
    // Sauvegarder le PDF
    const fileName = `Tache_${task.title.replace(/[^a-zA-Z0-9]/g, "_")}_${format(new Date(), "ddMMyyyy_HHmm")}.pdf`;
    doc.save(fileName);
  };

  const handleCommentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCommentPhoto(file);
      
      const url = URL.createObjectURL(file);
      setCommentPhotoPreview(url);
    }
  };

  const removeCommentPhoto = () => {
    if (commentPhotoPreview) {
      URL.revokeObjectURL(commentPhotoPreview);
    }
    setCommentPhoto(null);
    setCommentPhotoPreview("");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const commentData: Omit<TaskComment, 'id' | 'createdAt'> = {
      text: newComment.trim(),
      author: `${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`,
      type: "progress",
    };

    // Passer le fichier directement plutôt que l'URL blob
    onAddComment(task.id, commentData, commentPhoto || undefined);
    
    // Reset
    setNewComment("");
    setShowCommentForm(false);
    if (commentPhotoPreview) {
      URL.revokeObjectURL(commentPhotoPreview);
    }
    setCommentPhoto(null);
    setCommentPhotoPreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Créer les URLs de prévisualisation
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPhotoPreviewUrls(prev => [...prev, url]);
      });
    }
  };

  const removeSelectedPhoto = (index: number) => {
    // Libérer l'URL de l'objet
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPhotos = () => {
    if (selectedFiles.length === 0 || !onAddPhotos) return;
    
    const newPhotos: Omit<TaskPhoto, 'id'>[] = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      filename: file.name,
      uploadedAt: new Date(),
    }));
    
    onAddPhotos(task.id, newPhotos, selectedFiles);
    
    // Reset
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPhotoPreviewUrls([]);
    setShowPhotoUpload(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto mx-4">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                {(task as any).priority === 1 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <span>🔴</span> Urgent
                  </Badge>
                )}
                {(task as any).priority === 2 && (
                  <Badge variant="secondary">Normale</Badge>
                )}
                {(task as any).priority === 3 && (
                  <Badge variant="outline">Basse</Badge>
                )}
              </div>
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

          {/* Priorité modifiable */}
          <div>
            <h3 className="font-medium mb-2">Priorité</h3>
            <div className="flex gap-3">
              {[
                { value: 1, label: 'Urgente', color: 'bg-destructive text-destructive-foreground' },
                { value: 2, label: 'Normale', color: 'bg-status-progress text-status-progress-foreground' },
                { value: 3, label: 'Basse', color: 'bg-muted text-muted-foreground' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (onPriorityChange && (task as any).priority !== option.value) {
                      onPriorityChange(task.id, option.value);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium border-2 transition-all ${
                    (task as any).priority === option.value
                      ? `${option.color} border-transparent ring-2 ring-ring ring-offset-2`
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                >
                  {option.value} - {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          {task.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photos ({task.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {task.photos.map((photo, index) => (
                   <div key={photo.id} className="space-y-2">
                     <a
                       href={photo.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="block w-full h-32 rounded-lg border overflow-hidden bg-muted flex items-center justify-center"
                     >
                       <img
                         src={photo.url}
                         alt={photo.filename}
                         className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                         onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           target.parentElement!.innerHTML = '<span class="text-xs text-muted-foreground p-2 text-center">📷 Photo indisponible<br/>Appuyez pour ouvrir</span>';
                         }}
                       />
                     </a>
                     <p className="text-xs text-muted-foreground truncate">
                       📷 {photo.filename}
                     </p>
                     <p className="text-xs text-muted-foreground">
                       {format(photo.uploadedAt, 'dd/MM/yyyy HH:mm', { locale: fr })}
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
               <a
                 href={task.proofPhoto}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="block w-48 h-32 rounded-lg border overflow-hidden bg-muted flex items-center justify-center"
               >
                 <img
                   src={task.proofPhoto}
                   alt="Photo de validation"
                   className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     target.parentElement!.innerHTML = '<span class="text-xs text-muted-foreground p-2 text-center">📷 Photo indisponible<br/>Appuyez pour ouvrir</span>';
                   }}
                 />
               </a>
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
                    <p className="text-sm mb-2">{comment.text}</p>
                    
                    {/* Photo du commentaire */}
                    {comment.photo && (
                      <div className="mt-3">
                        <div className="w-48 h-32 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={comment.photo.url}
                            alt={comment.photo.filename}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(comment.photo!.url, '_blank')}
                            onError={(e) => {
                              console.warn('Erreur de chargement de l\'image de commentaire:', comment.photo?.url);
                              e.currentTarget.style.display = 'none';
                              // Afficher un placeholder
                              const placeholder = document.createElement('div');
                              placeholder.className = 'text-center text-blue-600 w-full h-full flex flex-col items-center justify-center';
                              placeholder.innerHTML = '<svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 6L12 10.5 8.5 8 5 13h14z"/></svg><p class="text-xs">Photo indisponible</p>';
                              e.currentTarget.parentNode?.appendChild(placeholder);
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          📷 {comment.photo.filename}
                        </p>
                      </div>
                    )}
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
                <Button onClick={() => onStatusChange(task.id, 'progress', `Tâche commencée par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                  Commencer la tâche
                </Button>
              )}
              
              {task.status === 'progress' && (
                <>
                  <Button onClick={() => onStatusChange(task.id, 'validation_requested', `Demande de validation par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                    Demander validation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStatusChange(task.id, 'pending', `Tâche remise en attente par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Remettre en attente
                  </Button>
                </>
              )}

              {task.status === 'validation_requested' && role !== 'agent' && (
                <>
                  <Button onClick={() => onStatusChange(task.id, 'validated', `Tâche validée par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                    Valider la tâche
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStatusChange(task.id, 'progress', `Tâche remise en cours par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Remettre en cours
                  </Button>
                </>
              )}
              {task.status === 'validation_requested' && role === 'agent' && (
                <Button 
                  variant="outline" 
                  onClick={() => onStatusChange(task.id, 'progress', `Tâche remise en cours par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Remettre en cours
                </Button>
              )}
              
              {task.status === 'validated' && (
                <Button 
                  variant="outline" 
                  onClick={() => onStatusChange(task.id, 'progress', `Tâche remise en cours par ${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`)}>
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
                  
                  {/* Section photo pour commentaire */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Photo (optionnel)</Label>
                    <div className="flex gap-3">
                      {/* Bouton prendre une photo */}
                      <div className="flex-1">
                        <input
                          id="comment-camera"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleCommentPhotoChange}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild className="w-full">
                          <Label htmlFor="comment-camera" className="cursor-pointer">
                            <Camera className="w-4 h-4 mr-2" />
                            Prendre photo
                          </Label>
                        </Button>
                      </div>
                      
                      {/* Bouton choisir depuis galerie */}
                      <div className="flex-1">
                        <input
                          id="comment-gallery"
                          type="file"
                          accept="image/*"
                          onChange={handleCommentPhotoChange}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild className="w-full">
                          <Label htmlFor="comment-gallery" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Galerie
                          </Label>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Prévisualisation photo commentaire */}
                    {commentPhotoPreview && (
                      <div className="relative inline-block">
                        <img
                          src={commentPhotoPreview}
                          alt="Photo du commentaire"
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeCommentPhoto}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {commentPhoto?.name}
                        </p>
                      </div>
                    )}
                  </div>
                  
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
                        if (commentPhotoPreview) {
                          URL.revokeObjectURL(commentPhotoPreview);
                        }
                        setCommentPhoto(null);
                        setCommentPhotoPreview("");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Ajout de photos */}
            {onAddPhotos && (
              <div className="space-y-3">
                {!showPhotoUpload ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPhotoUpload(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Ajouter des photos
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                    <Label htmlFor="photo-upload" className="text-sm font-medium">
                      Ajouter des photos
                    </Label>
                    
                    <div className="space-y-3">
                      {/* Bouton prendre une photo */}
                      <div className="border-2 border-dashed border-primary/25 rounded-lg p-3 text-center">
                        <Camera className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <input
                          id="camera-upload"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Label htmlFor="camera-upload" className="cursor-pointer">
                            Prendre une photo
                          </Label>
                        </Button>
                      </div>
                      
                      {/* Bouton choisir depuis galerie */}
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center">
                        <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <input
                          id="photo-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Label htmlFor="photo-upload" className="cursor-pointer">
                            Choisir depuis la galerie
                          </Label>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Prévisualisation des photos sélectionnées */}
                    {photoPreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {photoPreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Prévisualisation ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeSelectedPhoto(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 truncate px-1">
                              {selectedFiles[index]?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddPhotos} 
                        disabled={selectedFiles.length === 0}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Ajouter {selectedFiles.length} photo(s)
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowPhotoUpload(false);
                          photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                          setSelectedFiles([]);
                          setPhotoPreviewUrls([]);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}