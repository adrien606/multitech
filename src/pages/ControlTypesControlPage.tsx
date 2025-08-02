import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useControlTypes } from '@/hooks/useControlTypes';
import { ControlTypeModal } from '@/components/ControlTypeModal';
import { ControlTypeDeleteDialog } from '@/components/ControlTypeDeleteDialog';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import type { ControlType } from '@/hooks/useControlTypes';

export default function ControlTypesControlPage() {
  const navigate = useNavigate();
  const { controlTypes, loading, createControlType, updateControlType, deleteControlType } = useControlTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedControlType, setSelectedControlType] = useState<ControlType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedControlType(null);
    setModalOpen(true);
  };

  const handleEdit = (controlType: ControlType) => {
    setSelectedControlType(controlType);
    setModalOpen(true);
  };

  const handleDelete = (controlType: ControlType) => {
    setSelectedControlType(controlType);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (controlTypeData: Omit<ControlType, 'id' | 'created_at' | 'updated_at'>) => {
    setActionLoading(true);
    try {
      if (selectedControlType) {
        await updateControlType(selectedControlType.id, controlTypeData);
      } else {
        await createControlType(controlTypeData);
      }
      setModalOpen(false);
      setSelectedControlType(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedControlType) return;
    
    setActionLoading(true);
    try {
      await deleteControlType(selectedControlType.id);
      setDeleteDialogOpen(false);
      setSelectedControlType(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Chargement des types de contrôles...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/regulatory-controls/controls')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux contrôles
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gestion des Types de Contrôles</h2>
              <p className="text-muted-foreground mt-1">
                Gérez les types de contrôles disponibles pour vos contrôles réglementaires
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau type de contrôle
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Types de contrôles actifs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{controlTypes.filter(ct => ct.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Sur {controlTypes.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Types de contrôles inactifs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{controlTypes.filter(ct => !ct.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Types désactivés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{controlTypes.length}</div>
              <p className="text-xs text-muted-foreground">Tous types de contrôles</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des types de contrôles */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des types de contrôles</CardTitle>
            <CardDescription>Gérez les types de contrôles disponibles pour vos contrôles réglementaires</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controlTypes.map((controlType) => (
                  <TableRow key={controlType.id}>
                    <TableCell className="font-medium">{controlType.name}</TableCell>
                    <TableCell>
                      {controlType.description || (
                        <span className="text-muted-foreground italic">Aucune description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={controlType.is_active ? 'default' : 'secondary'}>
                        {controlType.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(controlType)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(controlType)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {controlTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun type de contrôle trouvé. Commencez par en ajouter un.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ControlTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        controlType={selectedControlType}
        onSave={handleSave}
        isLoading={actionLoading}
      />

      <ControlTypeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        controlType={selectedControlType}
        onConfirm={handleConfirmDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}