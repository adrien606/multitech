import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Shield, Edit, Trash2, Search } from 'lucide-react';
import { useControlTypes, ControlType } from '@/hooks/useControlTypes';
import { ControlTypeModal } from '@/components/ControlTypeModal';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ControlTypesPage() {
  const { controlTypes, loading, createControlType, updateControlType, deleteControlType } = useControlTypes();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ControlType | null>(null);

  const filteredTypes = controlTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateType = async (typeData: { name: string; description?: string }) => {
    const result = await createControlType(typeData);
    if (result.error) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return { error: result.error };
    } else {
      toast({
        title: "Succès",
        description: "Type de contrôle créé avec succès",
      });
      return { error: null };
    }
  };

  const handleUpdateType = async (typeData: { name: string; description?: string }) => {
    if (!editingType) return { error: "Aucun type sélectionné" };
    
    const result = await updateControlType(editingType.id, typeData);
    if (result.error) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return { error: result.error };
    } else {
      toast({
        title: "Succès",
        description: "Type de contrôle modifié avec succès",
      });
      setEditingType(null);
      return { error: null };
    }
  };

  const handleDeleteType = async (id: string) => {
    const result = await deleteControlType(id);
    if (result.error) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Type de contrôle supprimé avec succès",
      });
    }
  };

  const openCreateModal = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: ControlType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Types de Contrôle</h1>
            <p className="text-muted-foreground mt-2">
              Gestion des types de contrôles réglementaires
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau type
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un type de contrôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Types List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Actif
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {type.description && (
                  <CardDescription className="mb-4">
                    {type.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(type)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le type de contrôle "{type.name}" ?
                          Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteType(type.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTypes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun type de contrôle</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Aucun type de contrôle ne correspond à votre recherche"
                  : "Commencez par créer un nouveau type de contrôle"
                }
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier type
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <ControlTypeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        controlType={editingType}
        onSave={editingType ? handleUpdateType : handleCreateType}
      />
    </div>
  );
}