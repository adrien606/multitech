import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Building } from '@/types';
import { ProviderContract } from '@/hooks/useProviderContracts';

interface Provider {
  id: string;
  name: string;
}

interface ProviderContractEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSuccess: () => void;
  providers: Provider[];
  buildings: Building[];
  contract: ProviderContract | null;
  updateContractStatus: (id: string, status: 'active' | 'expired' | 'archived', notes?: string, buildingIds?: string[]) => Promise<void>;
}

export default function ProviderContractEditModal({
  isOpen,
  onClose,
  onEditSuccess,
  providers,
  buildings,
  contract,
  updateContractStatus
}: ProviderContractEditModalProps) {
  const [status, setStatus] = useState<'active' | 'expired' | 'archived'>('active');
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contract) {
      setStatus(contract.status);
      setSelectedBuildingIds(contract.buildings?.map(b => b.id) || []);
      setNotes(contract.notes || '');
    }
  }, [contract]);

  const handleUpdate = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      await updateContractStatus(contract.id, status, notes, selectedBuildingIds);
      onEditSuccess();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le contrat</DialogTitle>
          <DialogDescription>
            Modifier les détails du contrat "{contract.original_filename}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(value: 'active' | 'expired' | 'archived') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélection des bâtiments */}
          <div className="space-y-2">
            <Label>Bâtiments</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {buildings.map((building) => (
                <div key={building.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={building.id}
                    checked={selectedBuildingIds.includes(building.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBuildingIds(prev => [...prev, building.id]);
                      } else {
                        setSelectedBuildingIds(prev => prev.filter(id => id !== building.id));
                      }
                    }}
                  />
                  <Label htmlFor={building.id} className="text-sm">
                    {building.name} - {building.address}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajouter des notes ou commentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}