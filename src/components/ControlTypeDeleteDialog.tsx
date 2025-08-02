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
import { ControlType } from '@/hooks/useControlTypes';

interface ControlTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controlType: ControlType | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function ControlTypeDeleteDialog({ 
  open, 
  onOpenChange, 
  controlType, 
  onConfirm, 
  isLoading 
}: ControlTypeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le type de contrôle</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le type de contrôle <strong>{controlType?.name}</strong> ?
            Cette action est irréversible et supprimera également tous les contrôles 
            associés à ce type.
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