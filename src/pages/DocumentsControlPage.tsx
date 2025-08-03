import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Upload, Download, Calendar, Building2, Loader2, Eye, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useControlDocuments } from '@/hooks/useControlDocuments';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsControlPage() {
  const { documents, stats, loading, error, formatFileSize, refetch, deleteDocument } = useControlDocuments();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [regulatoryControls, setRegulatoryControls] = useState<Array<{ id: string; building_name: string; control_type_name: string }>>([]);
  const { toast } = useToast();

  // Charger les contrôles réglementaires pour le modal d'upload
  const loadRegulatoryControls = async () => {
    try {
      const { data, error } = await supabase
        .from('regulatory_controls')
        .select(`
          id,
          buildings(name),
          control_types(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedControls = (data || []).map(control => ({
        id: control.id,
        building_name: (control.buildings as any)?.name || '',
        control_type_name: (control.control_types as any)?.name || '',
      }));

      setRegulatoryControls(transformedControls);
    } catch (error) {
      console.error('Error loading regulatory controls:', error);
    }
  };

  // Fonction pour télécharger un document
  const downloadDocument = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('control-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${doc.original_filename} a été téléchargé`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  // Fonction pour visualiser un document
  const viewDocument = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('control-documents')
        .createSignedUrl(doc.file_path, 3600); // URL valide pendant 1 heure

      if (error) throw error;

      // Ouvrir le document dans un nouvel onglet
      window.open(data.signedUrl, '_blank');

    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Erreur de visualisation",
        description: "Impossible d'ouvrir le document",
        variant: "destructive",
      });
    }
  };

  // Fonction pour supprimer un document
  const handleDeleteDocument = async (doc: any) => {
    const { error } = await deleteDocument(doc.id, doc.file_path);
    
    if (error) {
      toast({
        title: "Erreur de suppression",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Document supprimé",
        description: `Le fichier ${doc.original_filename} a été supprimé`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Erreur lors du chargement des documents: {error}
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
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Documents</h2>
            <p className="text-muted-foreground mt-1">
              Centralisation des rapports et certificats de contrôle
            </p>
          </div>
          <Button 
            onClick={() => {
              loadRegulatoryControls();
              setIsUploadModalOpen(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Télécharger un document
          </Button>
        </div>

        {/* Statistiques des documents */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Tous types confondus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">À valider</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.validated}
              </div>
              <p className="text-xs text-muted-foreground">Approuvés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">Stockage utilisé</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents récents</CardTitle>
            <CardDescription>
              Derniers rapports et certificats téléchargés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{document.original_filename}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {document.building_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(document.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                        {document.control_type_name && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {document.control_type_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={document.status === 'validated' ? 'default' : document.status === 'pending' ? 'secondary' : 'destructive'}>
                      {document.status === 'validated' ? 'Validé' : document.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </Badge>
                    <Badge variant="outline">
                      {document.file_type === 'application/pdf' ? 'PDF' : document.file_type}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Visualiser le document"
                      onClick={() => viewDocument(document)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Télécharger le document"
                      onClick={() => downloadDocument(document)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Supprimer le document"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le document <strong>{document.original_filename}</strong> ?
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDocument(document)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun document trouvé
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal d'upload */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            refetch();
            setIsUploadModalOpen(false);
          }}
          regulatoryControls={regulatoryControls}
        />

      </div>
    </div>
  );
}