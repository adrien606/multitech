import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Building2, Shield } from 'lucide-react';
import { Building } from '@/hooks/useBuildings';
import { Provider } from '@/hooks/useProviders';
import { cn } from '@/lib/utils';

interface NewControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  providers: Provider[];
  onControlCreate: (controlData: {
    building_id: string;
    control_type_name: string;
    due_date: string;
    assigned_provider_id?: string;
    notes?: string;
  }) => void;
}

const controlTypes = [
  'Vérification périodique ascenseurs',
  'Contrôle incendie annuel',
  'Vérification électrique',
  'Contrôle climatisation',
  'Vérification gaz',
  'Contrôle sécurité',
  'Inspection sanitaire',
  'Contrôle accessibilité',
];

export function NewControlModal({
  isOpen,
  onClose,
  buildings,
  providers,
  onControlCreate,
}: NewControlModalProps) {
  const [formData, setFormData] = useState({
    building_id: '',
    control_type_name: '',
    due_date: undefined as Date | undefined,
    assigned_provider_id: 'none',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.building_id || !formData.control_type_name || !formData.due_date) {
      return;
    }

    setIsSubmitting(true);

    const controlData = {
      building_id: formData.building_id,
      control_type_name: formData.control_type_name,
      due_date: formData.due_date.toISOString(),
      assigned_provider_id: formData.assigned_provider_id === 'none' ? undefined : formData.assigned_provider_id || undefined,
      notes: formData.notes || undefined,
    };

    await onControlCreate(controlData);
    
    // Reset form
    setFormData({
      building_id: '',
      control_type_name: '',
      due_date: undefined,
      assigned_provider_id: 'none',
      notes: '',
    });
    
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      building_id: '',
      control_type_name: '',
      due_date: undefined,
      assigned_provider_id: 'none',
      notes: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Nouveau contrôle réglementaire
          </DialogTitle>
          <DialogDescription>
            Créer un nouveau contrôle réglementaire pour un bâtiment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bâtiment */}
            <div className="space-y-2">
              <Label htmlFor="building">Bâtiment *</Label>
              <Select 
                value={formData.building_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, building_id: value }))}
                required
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Sélectionner un bâtiment" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{building.name}</span>
                        <span className="text-xs text-muted-foreground">{building.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type de contrôle */}
            <div className="space-y-2">
              <Label htmlFor="control-type">Type de contrôle *</Label>
              <Select 
                value={formData.control_type_name} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, control_type_name: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de contrôle" />
                </SelectTrigger>
                <SelectContent>
                  {controlTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date d'échéance */}
            <div className="space-y-2">
              <Label>Date d'échéance *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(formData.due_date, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Prestataire assigné */}
            <div className="space-y-2">
              <Label htmlFor="provider">Prestataire (optionnel)</Label>
              <Select 
                value={formData.assigned_provider_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_provider_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun prestataire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun prestataire</SelectItem>
                  {providers.filter(p => p.is_active).map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-xs text-muted-foreground">{provider.specialties}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur le contrôle, exigences particulières..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.building_id || !formData.control_type_name || !formData.due_date}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Création...' : 'Créer le contrôle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}