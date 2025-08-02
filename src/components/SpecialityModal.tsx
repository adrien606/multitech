import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Speciality } from '@/hooks/useSpecialities';

interface SpecialityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality?: Speciality;
  onSave: (speciality: Omit<Speciality, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function SpecialityModal({ open, onOpenChange, speciality, onSave, isLoading }: SpecialityModalProps) {
  const [formData, setFormData] = useState({
    name: speciality?.name || '',
    description: speciality?.description || '',
    is_active: speciality?.is_active ?? true,
  });

  useEffect(() => {
    if (speciality) {
      setFormData({
        name: speciality.name || '',
        description: speciality.description || '',
        is_active: speciality.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [speciality]);

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
            {speciality ? 'Modifier la spécialité' : 'Nouvelle spécialité'}
          </DialogTitle>
          <DialogDescription>
            {speciality 
              ? 'Modifiez les informations de la spécialité.'
              : 'Ajoutez une nouvelle spécialité à votre liste.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la spécialité *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Plomberie, Électricité..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez cette spécialité..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Spécialité active</Label>
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
              {isLoading ? 'Enregistrement...' : speciality ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}