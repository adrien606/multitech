import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building, Task } from "@/types";
import { Agent } from "@/types/agent";
import { BuildingSelector } from "./BuildingSelector";
import { Calendar, Upload, X } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  agents: Agent[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function NewTaskModal({ isOpen, onClose, buildings, agents, onTaskCreate }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buildingId: '',
    dueDate: '',
    assignedTo: (agents && agents.length > 0) ? `${agents[0].firstName} ${agents[0].lastName}` : 'Agent Technique',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.buildingId || !formData.dueDate) {
      return;
    }

    const selectedBuilding = buildings.find(b => b.id === formData.buildingId);
    if (!selectedBuilding) return;

    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      buildingId: formData.buildingId,
      buildingName: selectedBuilding.name,
      status: 'pending',
      dueDate: new Date(formData.dueDate),
      assignedTo: formData.assignedTo,
      photos: [], // TODO: Gérer l'upload des photos
      comments: [
        {
          id: `c${Date.now()}`,
          text: "Tâche créée et assignée.",
          createdAt: new Date(),
          author: "Superviseur",
          type: 'assignment',
        }
      ],
    };

    onTaskCreate(newTask);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      buildingId: '',
      dueDate: '',
      assignedTo: (agents && agents.length > 0) ? `${agents[0].firstName} ${agents[0].lastName}` : 'Agent Technique',
    });
    setPhotos([]);
    setPhotoPreviewUrls([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      
      // Créer les URLs de prévisualisation
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPhotoPreviewUrls(prev => [...prev, url]);
      });
    }
  };

  const removePhoto = (index: number) => {
    // Libérer l'URL de l'objet
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche de maintenance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la tâche *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Vérification système de chauffage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigné à</Label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {agents && agents.filter(agent => agent.isActive).map(agent => (
                  <option key={agent.id} value={`${agent.firstName} ${agent.lastName}`}>
                    {agent.firstName} {agent.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez en détail la tâche à effectuer..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bâtiment *</Label>
              <BuildingSelector
                buildings={buildings}
                value={formData.buildingId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, buildingId: value }))}
                placeholder="Sélectionner un bâtiment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={today}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">Photos (optionnel)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="outline" asChild>
                <Label htmlFor="photos" className="cursor-pointer">
                  Ajouter des photos
                </Label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Formats acceptés: JPG, PNG, GIF
              </p>
            </div>
            
            {/* Prévisualisation des photos */}
            {photoPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {photos[index]?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la tâche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}