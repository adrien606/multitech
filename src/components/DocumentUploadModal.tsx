import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  regulatoryControls: Array<{
    id: string;
    building_name: string;
    control_type_name: string;
  }>;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  regulatoryControls
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedControlId) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un fichier et un contrôle",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Générer un nom de fichier unique
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${selectedControlId}/${fileName}`;

      // Upload vers le bucket control-documents
      const { error: uploadError } = await supabase.storage
        .from('control-documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Enregistrer les métadonnées dans la table control_documents
      const { error: dbError } = await supabase
        .from('control_documents')
        .insert({
          regulatory_control_id: selectedControlId,
          filename: fileName,
          original_filename: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          status: 'pending',
          notes: notes || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Document téléchargé",
        description: "Le document a été téléchargé avec succès",
      });

      // Reset form
      setSelectedFile(null);
      setSelectedControlId('');
      setNotes('');
      onUploadSuccess();
      onClose();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Télécharger un document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection du contrôle */}
          <div className="space-y-2">
            <Label htmlFor="control">Contrôle réglementaire *</Label>
            <Select value={selectedControlId} onValueChange={setSelectedControlId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un contrôle" />
              </SelectTrigger>
              <SelectContent>
                {regulatoryControls.map((control) => (
                  <SelectItem key={control.id} value={control.id}>
                    {control.building_name} - {control.control_type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection du fichier */}
          <div className="space-y-2">
            <Label htmlFor="file">Fichier *</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Cliquez pour sélectionner un fichier</span>
                  <span className="text-xs">PDF, DOC, DOCX, JPG, PNG (max 10MB)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes concernant ce document..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !selectedControlId}>
              {uploading ? "Téléchargement..." : "Télécharger"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}