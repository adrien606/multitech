import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Speciality } from '@/hooks/useSpecialities';

interface SpecialityDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality: Speciality | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function SpecialityDeleteDialog({ 
  open, 
  onOpenChange, 
  speciality, 
  onConfirm, 
  isLoading 
}: SpecialityDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la spécialité</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la spécialité <strong>{speciality?.name}</strong> ?
            Cette action est irréversible et supprimera également toutes les associations 
            avec les prestataires.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}