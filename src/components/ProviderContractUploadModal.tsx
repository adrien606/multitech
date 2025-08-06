import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { supabase } from '@/integrations/supabase/client';
import { Building } from '@/types';

interface Provider {
  id: string;
  name: string;
}

interface ProviderContractUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  providers: Provider[];
  buildings: Building[];
}

export default function ProviderContractUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  providers,
  buildings
}: ProviderContractUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const { uploadMultipleFiles, uploading } = useStorageUpload();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} dépasse la limite de 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un fichier",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProviderId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un prestataire",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload files to storage
      const uploadResults = await uploadMultipleFiles(selectedFiles, 'control-documents');
      
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        
        // Save metadata to database
        const contractsData = uploadResults.map((result, index) => ({
          provider_id: selectedProviderId,
          file_path: result.url.split('/').pop(), // Extract filename from URL
          original_filename: result.filename,
          filename: result.filename,
          file_type: selectedFiles[index].type,
          file_size: selectedFiles[index].size,
          notes: notes || null,
          uploaded_by: userData.user?.id,
          status: 'active'
        }));

        const { data: insertedContracts, error } = await (supabase as any)
          .from('provider_contracts')
          .insert(contractsData)
          .select('id');

      if (error) throw error;

      // Associate buildings with contracts
      if (selectedBuildingIds.length > 0 && insertedContracts) {
        const buildingAssociations = insertedContracts.flatMap((contract: any) => 
          selectedBuildingIds.map(buildingId => ({
            provider_contract_id: contract.id,
            building_id: buildingId
          }))
        );

        await (supabase as any)
          .from('provider_contract_buildings')
          .insert(buildingAssociations);
      }

      toast({
        title: "Upload réussi",
        description: `${selectedFiles.length} contrat(s) téléchargé(s) avec succès`,
      });

      // Reset form
      setSelectedFiles([]);
      setSelectedProviderId('');
      setSelectedBuildingIds([]);
      setNotes('');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors du téléchargement",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Télécharger un contrat de prestataire</DialogTitle>
          <DialogDescription>
            Sélectionnez un ou plusieurs fichiers et assignez-les à un prestataire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sélection du prestataire */}
          <div className="space-y-2">
            <Label htmlFor="provider">Prestataire *</Label>
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un prestataire" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload de fichiers */}
          <div className="space-y-2">
            <Label htmlFor="files">Fichiers *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                id="files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('files')?.click()}
                className="mb-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Sélectionner des fichiers
              </Button>
              <p className="text-sm text-muted-foreground">
                PDF, DOC, DOCX, JPG, PNG (max 10MB chacun)
              </p>
            </div>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Fichiers sélectionnés ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sélection des bâtiments */}
          <div className="space-y-2">
            <Label>Bâtiments (optionnel)</Label>
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
            <Label htmlFor="notes">Notes (optionnel)</Label>
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
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Annuler
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}