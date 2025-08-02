import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useSpecialities } from '@/hooks/useSpecialities';
import { SpecialityModal } from '@/components/SpecialityModal';
import { SpecialityDeleteDialog } from '@/components/SpecialityDeleteDialog';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import type { Speciality } from '@/hooks/useSpecialities';

export default function SpecialitiesControlPage() {
  const navigate = useNavigate();
  const { specialities, loading, createSpeciality, updateSpeciality, deleteSpeciality } = useSpecialities();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedSpeciality(null);
    setModalOpen(true);
  };

  const handleEdit = (speciality: Speciality) => {
    setSelectedSpeciality(speciality);
    setModalOpen(true);
  };

  const handleDelete = (speciality: Speciality) => {
    setSelectedSpeciality(speciality);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (specialityData: Omit<Speciality, 'id' | 'created_at' | 'updated_at'>) => {
    setActionLoading(true);
    try {
      if (selectedSpeciality) {
        await updateSpeciality(selectedSpeciality.id, specialityData);
      } else {
        await createSpeciality(specialityData);
      }
      setModalOpen(false);
      setSelectedSpeciality(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSpeciality) return;
    
    setActionLoading(true);
    try {
      await deleteSpeciality(selectedSpeciality.id);
      setDeleteDialogOpen(false);
      setSelectedSpeciality(null);
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
            <div className="text-muted-foreground">Chargement des spécialités...</div>
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
              onClick={() => navigate('/regulatory-controls/providers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux prestataires
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gestion des Spécialités</h2>
              <p className="text-muted-foreground mt-1">
                Gérez les spécialités disponibles pour les prestataires
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle spécialité
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spécialités actives</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{specialities.filter(s => s.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Sur {specialities.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spécialités inactives</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{specialities.filter(s => !s.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Spécialités désactivées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{specialities.length}</div>
              <p className="text-xs text-muted-foreground">Toutes spécialités</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des spécialités */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des spécialités</CardTitle>
            <CardDescription>Gérez les spécialités disponibles pour vos prestataires</CardDescription>
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
                {specialities.map((speciality) => (
                  <TableRow key={speciality.id}>
                    <TableCell className="font-medium">{speciality.name}</TableCell>
                    <TableCell>
                      {speciality.description || (
                        <span className="text-muted-foreground italic">Aucune description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={speciality.is_active ? 'default' : 'secondary'}>
                        {speciality.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(speciality)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(speciality)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {specialities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune spécialité trouvée. Commencez par en ajouter une.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <SpecialityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        speciality={selectedSpeciality}
        onSave={handleSave}
        isLoading={actionLoading}
      />

      <SpecialityDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        speciality={selectedSpeciality}
        onConfirm={handleConfirmDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}