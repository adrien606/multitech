import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building } from "@/hooks/useBuildings";
import { toast } from "sonner";

interface BuildingEditModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (buildingId: string, clientBilling: boolean) => void;
}

export function BuildingEditModal({ building, isOpen, onClose, onSave }: BuildingEditModalProps) {
  const [clientBilling, setClientBilling] = useState(false);

  useEffect(() => {
    if (building) {
      // Pour l'instant, on simule - après Supabase on utilisera building.client_billing
      setClientBilling(false);
    }
  }, [building]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!building) return;

    onSave(building.id, clientBilling);
    toast.success("Paramètres de refacturation mis à jour");
    onClose();
  };

  if (!building) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la refacturation - {building.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Paramètres de facturation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configurez si ce bâtiment nécessite une refacturation client pour les consommations électriques.
              </p>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="clientBilling"
                checked={clientBilling}
                onCheckedChange={(checked) => setClientBilling(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="clientBilling" className="text-sm font-medium leading-none">
                  Refacturation client
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Activer la gestion des compteurs électriques pour ce bâtiment
                </p>
              </div>
            </div>

            {clientBilling && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ Ce bâtiment apparaîtra dans la section "Compteurs" pour la saisie des relevés mensuels.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}