import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ControlType } from '@/hooks/useControlTypes';

interface ControlTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controlType?: ControlType;
  onSave: (controlType: Omit<ControlType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function ControlTypeModal({ open, onOpenChange, controlType, onSave, isLoading }: ControlTypeModalProps) {
  const [formData, setFormData] = useState({
    name: controlType?.name || '',
    description: controlType?.description || '',
    is_active: controlType?.is_active ?? true,
  });

  useEffect(() => {
    if (controlType) {
      setFormData({
        name: controlType.name || '',
        description: controlType.description || '',
        is_active: controlType.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [controlType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        is_active: true,
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {controlType ? 'Modifier le type de contrôle' : 'Nouveau type de contrôle'}
          </DialogTitle>
          <DialogDescription>
            {controlType 
              ? 'Modifiez les informations du type de contrôle.'
              : 'Ajoutez un nouveau type de contrôle à votre liste.'
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
              placeholder="Ex: Contrôle ascenseur, Vérification incendie..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez ce type de contrôle..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Type de contrôle actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Enregistrement...' : controlType ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}