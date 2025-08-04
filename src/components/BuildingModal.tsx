import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building } from "@/hooks/useBuildings";

interface BuildingModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: Pick<Building, 'name' | 'address' | 'description' | 'client_billing_enabled'>) => void;
  mode: 'create' | 'edit';
}

export function BuildingModal({ building, isOpen, onClose, onSave, mode }: BuildingModalProps) {
  const [formData, setFormData] = useState({
    name: building?.name || '',
    address: building?.address || '',
    description: building?.description || '',
    client_billing_enabled: building?.client_billing_enabled || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      return;
    }

    onSave(formData);
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      description: '',
      client_billing_enabled: false,
    });
    onClose();
  };

  // Reset form when building changes or modal opens
  useEffect(() => {
    if (building && mode === 'edit') {
      setFormData({
        name: building.name,
        address: building.address,
        description: building.description || '',
        client_billing_enabled: building.client_billing_enabled || false,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        address: '',
        description: '',
        client_billing_enabled: false,
      });
    }
  }, [building, mode, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nouveau bâtiment' : 'Modifier le bâtiment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du bâtiment *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Bâtiment A - Bureaux"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ex: 123 Avenue des Entreprises, 75001 Paris"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Immeuble de bureaux de 8 étages"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="clientBilling"
              checked={formData.client_billing_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, client_billing_enabled: checked as boolean }))}
            />
            <Label htmlFor="clientBilling" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Refacturation client
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Créer' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}