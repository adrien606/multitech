import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useControlTypes, ControlType } from '@/hooks/useControlTypes';
import { toast } from '@/hooks/use-toast';

interface ControlTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditingType {
  id?: string;
  name: string;
  description: string;
  recurrence_months: number;
  average_cost: number;
}

export const ControlTypesModal: React.FC<ControlTypesModalProps> = ({ isOpen, onClose }) => {
  const { controlTypes, loading, createControlType, updateControlType, deleteControlType } = useControlTypes();
  const [editingType, setEditingType] = useState<EditingType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (controlType: ControlType) => {
    setEditingType({
      id: controlType.id,
      name: controlType.name,
      description: controlType.description || '',
      recurrence_months: controlType.recurrence_months,
      average_cost: controlType.average_cost || 0,
    });
  };

  const handleCreate = () => {
    setEditingType({
      name: '',
      description: '',
      recurrence_months: 12,
      average_cost: 0,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingType) return;

    try {
      const data = {
        name: editingType.name,
        description: editingType.description || undefined,
        recurrence_months: editingType.recurrence_months,
        average_cost: editingType.average_cost || undefined,
        is_active: true,
      };

      if (isCreating) {
        await createControlType(data);
      } else if (editingType.id) {
        await updateControlType(editingType.id, data);
      }

      setEditingType(null);
      setIsCreating(false);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de contrôle ?')) {
      await deleteControlType(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des Types de Contrôle</DialogTitle>
          <DialogDescription>
            Gérez les différents types de contrôles réglementaires
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Types de contrôle</h3>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau type
            </Button>
          </div>

          {/* Form for creating/editing */}
          {editingType && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">
                  {isCreating ? 'Nouveau type de contrôle' : 'Modifier le type de contrôle'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du type</Label>
                    <Input
                      id="name"
                      value={editingType.name}
                      onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                      placeholder="Ex: Contrôle électrique"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recurrence">Récurrence (mois)</Label>
                    <Input
                      id="recurrence"
                      type="number"
                      value={editingType.recurrence_months}
                      onChange={(e) => setEditingType({ ...editingType, recurrence_months: parseInt(e.target.value) || 12 })}
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingType.description}
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                    placeholder="Description du type de contrôle"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Coût moyen (€)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={editingType.average_cost}
                    onChange={(e) => setEditingType({ ...editingType, average_cost: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List of control types */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : controlTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun type de contrôle configuré
              </div>
            ) : (
              controlTypes.map((controlType) => (
                <Card key={controlType.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{controlType.name}</h4>
                          <Badge variant="secondary">
                            {controlType.recurrence_months} mois
                          </Badge>
                          {controlType.average_cost && (
                            <Badge variant="outline">
                              {formatCurrency(controlType.average_cost)}
                            </Badge>
                          )}
                        </div>
                        {controlType.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {controlType.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(controlType.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(controlType)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(controlType.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};