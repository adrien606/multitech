import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Provider } from '@/hooks/useProviders';
import { useSpecialities } from '@/hooks/useSpecialities';
import { useBuildings } from '@/hooks/useBuildings';

interface ProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: Provider;
  onSave: (provider: Omit<Provider, 'id' | 'created_at' | 'updated_at'>, specialityIds: string[], buildingIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ProviderModal({ open, onOpenChange, provider, onSave, isLoading }: ProviderModalProps) {
  const { specialities } = useSpecialities();
  const { buildings } = useBuildings();
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    email: provider?.email || '',
    phone: provider?.phone || '',
    description: provider?.description || '',
    is_active: provider?.is_active ?? true,
  });
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);

  // Mettre à jour le formulaire quand les données du provider changent
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        email: provider.email || '',
        phone: provider.phone || '',
        description: provider.description || '',
        is_active: provider.is_active ?? true,
      });
      // Charger les spécialités du prestataire
      const providerSpecialityIds = (provider as any).provider_specialities?.map((ps: any) => ps.speciality.id) || [];
      setSelectedSpecialities(providerSpecialityIds);
      
      // Charger les bâtiments du prestataire
      const providerBuildingIds = provider.buildings?.map(building => building.id) || [];
      setSelectedBuildings(providerBuildingIds);
    } else {
      // Reset pour un nouveau prestataire
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
        is_active: true,
      });
      setSelectedSpecialities([]);
      setSelectedBuildings([]);
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await onSave(formData, selectedSpecialities, selectedBuildings);
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
        is_active: true,
      });
      setSelectedSpecialities([]);
      setSelectedBuildings([]);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {provider ? 'Modifier le prestataire' : 'Nouveau prestataire'}
          </DialogTitle>
          <DialogDescription>
            {provider 
              ? 'Modifiez les informations du prestataire.'
              : 'Ajoutez un nouveau prestataire à votre liste.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du prestataire *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de l'entreprise"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@entreprise.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bâtiments</Label>
            <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto border rounded-md p-3">
              {buildings.map((building) => (
                <div key={building.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`building-${building.id}`}
                    checked={selectedBuildings.includes(building.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBuildings(prev => [...prev, building.id]);
                      } else {
                        setSelectedBuildings(prev => prev.filter(id => id !== building.id));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`building-${building.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {building.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Prestataire actif</Label>
          </div>


          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez les services du prestataire..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Spécialités</Label>
            <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto border rounded-md p-3">
              {specialities.map((speciality) => (
                <div key={speciality.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`speciality-${speciality.id}`}
                    checked={selectedSpecialities.includes(speciality.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSpecialities(prev => [...prev, speciality.id]);
                      } else {
                        setSelectedSpecialities(prev => prev.filter(id => id !== speciality.id));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`speciality-${speciality.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {speciality.name}
                  </Label>
                </div>
              ))}
            </div>
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
              {isLoading ? 'Enregistrement...' : provider ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}