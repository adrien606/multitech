import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ElectricalMeter, CreateMeterData, UpdateMeterData } from "@/hooks/useElectricalMeters";

interface ElectricalMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  meter?: ElectricalMeter;
  buildingId: string;
  onSubmit: (data: CreateMeterData | UpdateMeterData) => void;
  isLoading: boolean;
}

export function ElectricalMeterModal({
  isOpen,
  onClose,
  meter,
  buildingId,
  onSubmit,
  isLoading
}: ElectricalMeterModalProps) {
  const [formData, setFormData] = useState({
    meter_number: "",
    name: "",
    pdl_number: "",
    supplier: "",
    contract_reference: "",
    is_active: true,
    notes: ""
  });

  useEffect(() => {
    if (meter) {
      setFormData({
        meter_number: meter.meter_number,
        name: meter.name,
        pdl_number: meter.pdl_number || "",
        supplier: meter.supplier || "",
        contract_reference: meter.contract_reference || "",
        is_active: meter.is_active,
        notes: meter.notes || ""
      });
    } else {
      setFormData({
        meter_number: "",
        name: "",
        pdl_number: "",
        supplier: "",
        contract_reference: "",
        is_active: true,
        notes: ""
      });
    }
  }, [meter, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meter_number.trim() || !formData.name.trim()) {
      return;
    }

    const submitData = {
      ...formData,
      meter_number: formData.meter_number.trim(),
      name: formData.name.trim(),
      pdl_number: formData.pdl_number.trim() || undefined,
      supplier: formData.supplier.trim() || undefined,
      contract_reference: formData.contract_reference.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (meter) {
      onSubmit({
        id: meter.id,
        ...submitData
      });
    } else {
      onSubmit({
        building_id: buildingId,
        ...submitData
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {meter ? "Modifier le compteur électrique" : "Ajouter un compteur électrique"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meter_number">Numéro de compteur *</Label>
              <Input
                id="meter_number"
                value={formData.meter_number}
                onChange={(e) => setFormData({ ...formData, meter_number: e.target.value })}
                placeholder="Ex: 12345678"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du compteur *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Compteur principal"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdl_number">Numéro PDL</Label>
            <Input
              id="pdl_number"
              value={formData.pdl_number}
              onChange={(e) => setFormData({ ...formData, pdl_number: e.target.value })}
              placeholder="Ex: 12345678901234"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Ex: EDF, Engie..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_reference">Référence contrat</Label>
              <Input
                id="contract_reference"
                value={formData.contract_reference}
                onChange={(e) => setFormData({ ...formData, contract_reference: e.target.value })}
                placeholder="Ex: CTR123456"
                disabled={isLoading}
              />
            </div>
          </div>

          {meter && (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={isLoading}
              />
              <Label htmlFor="is_active">Compteur actif</Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.meter_number.trim() || !formData.name.trim()}
            >
              {meter ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}