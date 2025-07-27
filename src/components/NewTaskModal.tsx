import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building, Task } from "@/types";
import { BuildingSelector } from "./BuildingSelector";
import { Calendar, Upload } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function NewTaskModal({ isOpen, onClose, buildings, onTaskCreate }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buildingId: '',
    dueDate: '',
    assignedTo: 'Agent Technique',
  });

  const [photos, setPhotos] = useState<File[]>([]);

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
      assignedTo: 'Agent Technique',
    });
    setPhotos([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
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
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
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
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="photos" className="cursor-pointer">
                <span className="text-sm text-muted-foreground">
                  Cliquez pour ajouter des photos ou glissez-déposez
                </span>
              </Label>
              {photos.length > 0 && (
                <p className="text-sm text-primary mt-2">
                  {photos.length} photo(s) sélectionnée(s)
                </p>
              )}
            </div>
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