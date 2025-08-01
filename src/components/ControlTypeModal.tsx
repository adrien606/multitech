import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield } from 'lucide-react';
import { ControlType } from '@/hooks/useControlTypes';

interface ControlTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlType?: ControlType | null;
  onSave: (typeData: { name: string; description?: string }) => Promise<{ error: string | null }>;
}

export function ControlTypeModal({
  isOpen,
  onClose,
  controlType,
  onSave,
}: ControlTypeModalProps) {
  const [formData, setFormData] = useState({
    name: controlType?.name || '',
    description: controlType?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    const result = await onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    if (!result.error) {
      handleClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFormData({
      name: controlType?.name || '',
      description: controlType?.description || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            {controlType ? 'Modifier le type de contrôle' : 'Nouveau type de contrôle'}
          </DialogTitle>
          <DialogDescription>
            {controlType 
              ? 'Modifier les informations du type de contrôle'
              : 'Créer un nouveau type de contrôle réglementaire'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du type de contrôle *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Vérification périodique ascenseurs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du type de contrôle, réglementation applicable..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Enregistrement...' : (controlType ? 'Modifier' : 'Créer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}