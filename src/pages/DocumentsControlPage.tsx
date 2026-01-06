import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Calendar, Building2, Loader2, Eye, Trash2, File, Filter, Edit, Pencil } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useControlDocuments } from '@/hooks/useControlDocuments';
import { useProviderContracts } from '@/hooks/useProviderContracts';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import ProviderContractUploadModal from '@/components/ProviderContractUploadModal';
import ProviderContractEditModal from '@/components/ProviderContractEditModal';
import { DocumentFilters } from '@/components/DocumentFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building } from '@/types';

export default function DocumentsControlPage() {
  const { documents, stats, loading, error, formatFileSize, refetch, deleteDocument, renameDocument } = useControlDocuments();
  const { contracts, loading: contractsLoading, deleteContract, renameContract, formatFileSize: formatContractFileSize, refetch: refetchContracts, updateContractStatus } = useProviderContracts();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isContractUploadModalOpen, setIsContractUploadModalOpen] = useState(false);
  const [isContractEditModalOpen, setIsContractEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [regulatoryControls, setRegulatoryControls] = useState<Array<{ id: string; building_name: string; control_type_name: string }>>([]);
  const { toast } = useToast();

  // État pour le renommage de document
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState<any>(null);
  const [newDocumentName, setNewDocumentName] = useState('');

  // État pour le renommage de contrat
  const [isContractRenameModalOpen, setIsContractRenameModalOpen] = useState(false);
  const [contractToRename, setContractToRename] = useState<any>(null);
  const [newContractName, setNewContractName] = useState('');

  // États pour les filtres
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);
  const [controlTypes, setControlTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedControlType, setSelectedControlType] = useState<string>('');
  
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  
  // États pour les filtres des contrats
  const [contractProviderFilter, setContractProviderFilter] = useState<string>('');

  // Charger les données pour les filtres
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [buildingsResponse, providersResponse, controlTypesResponse] = await Promise.all([
          supabase.from('buildings').select('id, name, address, description, created_at, updated_at').order('name'),
          supabase.from('providers').select('id, name').eq('is_active', true).order('name'),
          supabase.from('control_types').select('id, name').eq('is_active', true).order('name'),
        ]);

        if (buildingsResponse.data) {
          const transformedBuildings = buildingsResponse.data.map(building => ({
            id: building.id,
            name: building.name,
            address: building.address,
            description: building.description,
            createdAt: new Date(building.created_at)
          }));
          setBuildings(transformedBuildings);
        }
        if (providersResponse.data) setProviders(providersResponse.data);
        if (controlTypesResponse.data) setControlTypes(controlTypesResponse.data);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    loadFilterData();
  }, []);

  // Filtrer les documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Filtre par bâtiment
      if (selectedBuilding && doc.building_id !== selectedBuilding) return false;
      
      // Filtre par prestataire
      if (selectedProvider && doc.provider_id !== selectedProvider) return false;
      
      // Filtre par type de contrôle
      if (selectedControlType && doc.control_type_id !== selectedControlType) return false;
      
      // Filtre par période
      if (dateFrom || dateTo) {
        const docDate = new Date(doc.created_at);
        if (dateFrom && docDate < dateFrom) return false;
        if (dateTo && docDate > dateTo) return false;
      }
      
      return true;
    });
  }, [documents, selectedBuilding, selectedProvider, selectedControlType, dateFrom, dateTo]);

  // Filtrer les contrats
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (contractProviderFilter && contract.provider_id !== contractProviderFilter) return false;
      return true;
    });
  }, [contracts, contractProviderFilter]);

  // Fonction pour réinitialiser les filtres
  const clearFilters = () => {
    setSelectedBuilding('');
    setSelectedProvider('');
    setSelectedControlType('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const clearContractFilters = () => {
    setContractProviderFilter('');
  };

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

  // Fonction pour ouvrir le modal de renommage
  const openRenameModal = (doc: any) => {
    setDocumentToRename(doc);
    setNewDocumentName(doc.original_filename);
    setIsRenameModalOpen(true);
  };

  // Fonction pour renommer un document
  const handleRenameDocument = async () => {
    if (!documentToRename || !newDocumentName.trim()) return;
    
    const { error } = await renameDocument(documentToRename.id, newDocumentName.trim());
    
    if (error) {
      toast({
        title: "Erreur de renommage",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Document renommé",
        description: `Le fichier a été renommé en "${newDocumentName.trim()}"`,
      });
      setIsRenameModalOpen(false);
      setDocumentToRename(null);
      setNewDocumentName('');
    }
  };

  // Fonction pour supprimer un contrat
  const handleDeleteContract = async (contract: any) => {
    const { error } = await deleteContract(contract.id, contract.file_path);
    
    if (error) {
      toast({
        title: "Erreur de suppression",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Contrat supprimé",
        description: `Le fichier ${contract.original_filename} a été supprimé`,
      });
    }
  };

  // Fonction pour ouvrir le modal de renommage de contrat
  const openContractRenameModal = (contract: any) => {
    setContractToRename(contract);
    setNewContractName(contract.original_filename);
    setIsContractRenameModalOpen(true);
  };

  // Fonction pour renommer un contrat
  const handleRenameContract = async () => {
    if (!contractToRename || !newContractName.trim()) return;
    
    const { error } = await renameContract(contractToRename.id, newContractName.trim());
    
    if (error) {
      toast({
        title: "Erreur de renommage",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Contrat renommé",
        description: `Le fichier a été renommé en "${newContractName.trim()}"`,
      });
      setIsContractRenameModalOpen(false);
      setContractToRename(null);
      setNewContractName('');
    }
  };

  // Fonctions pour télécharger et visualiser les contrats
  const downloadContract = async (contract: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('control-documents')
        .download(contract.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = contract.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${contract.original_filename} a été téléchargé`,
      });
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le contrat",
        variant: "destructive",
      });
    }
  };

  const viewContract = async (contract: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('control-documents')
        .createSignedUrl(contract.file_path, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing contract:', error);
      toast({
        title: "Erreur de visualisation",
        description: "Impossible d'ouvrir le contrat",
        variant: "destructive",
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
            <h2 className="text-2xl font-bold text-foreground">Drive Documents</h2>
            <p className="text-muted-foreground mt-1">
              Gestion complète des documents de contrôle réglementaire
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


        {/* Filtres */}
        <DocumentFilters
          buildings={buildings}
          providers={providers}
          controlTypes={controlTypes}
          selectedBuilding={selectedBuilding}
          selectedProvider={selectedProvider}
          selectedControlType={selectedControlType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onBuildingChange={setSelectedBuilding}
          onProviderChange={setSelectedProvider}
          onControlTypeChange={setSelectedControlType}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onClearFilters={clearFilters}
          filteredCount={filteredDocuments.length}
          totalCount={documents.length}
        />

        {/* Liste des documents */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les documents</CardTitle>
            <CardDescription>
              Rapports et certificats de contrôle réglementaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
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
                    <Badge variant="outline">
                      {document.file_type === 'application/pdf' ? 'PDF' : document.file_type}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Renommer le document"
                      onClick={() => openRenameModal(document)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
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
              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {documents.length === 0 ? 'Aucun document trouvé' : 'Aucun document ne correspond aux filtres sélectionnés'}
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

        <Separator className="my-8" />

        {/* Section Contrats de Prestataires */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Contrats de Prestataires</h3>
            <p className="text-muted-foreground mt-1">
              Gestion des contrats et documents non liés aux contrôles
            </p>
          </div>
          <Button 
            onClick={() => setIsContractUploadModalOpen(true)}
            variant="outline"
          >
            <File className="w-4 h-4 mr-2" />
            Télécharger un contrat
          </Button>
        </div>

        {/* Filtres pour les contrats */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={contractProviderFilter} onValueChange={setContractProviderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par prestataire" />
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
              <Button 
                variant="outline" 
                onClick={clearContractFilters}
                disabled={!contractProviderFilter}
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {filteredContracts.length} contrat(s) affiché(s) sur {contracts.length} total
            </div>
          </CardContent>
        </Card>

        {/* Liste des contrats */}
        <Card>
          <CardHeader>
            <CardTitle>Contrats de prestataires</CardTitle>
            <CardDescription>
              Documents contractuels et annexes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <File className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contract.original_filename}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {contract.provider_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <span>{formatContractFileSize(contract.file_size)}</span>
                          <Badge 
                            variant={
                              contract.status === 'active' ? 'default' : 
                              contract.status === 'expired' ? 'destructive' : 'secondary'
                            }
                          >
                            {contract.status === 'active' ? 'Actif' : 
                             contract.status === 'expired' ? 'Expiré' : 'Archivé'}
                          </Badge>
                        </div>
                         {contract.buildings && contract.buildings.length > 0 && (
                           <div className="flex flex-wrap gap-1 mt-2">
                             {contract.buildings.map((building) => (
                               <Badge key={building.id} variant="secondary" className="text-xs px-2 py-1">
                                 {building.name}
                               </Badge>
                             ))}
                           </div>
                         )}
                         {contract.notes && (
                           <p className="text-xs text-muted-foreground mt-1">{contract.notes}</p>
                         )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {contract.file_type === 'application/pdf' ? 'PDF' : contract.file_type}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Renommer le contrat"
                        onClick={() => openContractRenameModal(contract)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Visualiser le contrat"
                        onClick={() => viewContract(contract)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         title="Télécharger le contrat"
                         onClick={() => downloadContract(contract)}
                       >
                         <Download className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         title="Modifier le contrat"
                         onClick={() => {
                           setSelectedContract(contract);
                           setIsContractEditModalOpen(true);
                         }}
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Supprimer le contrat"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le contrat</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le contrat <strong>{contract.original_filename}</strong> ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteContract(contract)}
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
                {filteredContracts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {contracts.length === 0 ? 'Aucun contrat trouvé' : 'Aucun contrat ne correspond aux filtres sélectionnés'}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal d'upload pour les contrats */}
        <ProviderContractUploadModal
          isOpen={isContractUploadModalOpen}
          onClose={() => setIsContractUploadModalOpen(false)}
          onUploadSuccess={() => {
            refetchContracts();
            setIsContractUploadModalOpen(false);
          }}
          providers={providers}
          buildings={buildings}
        />

        <ProviderContractEditModal
          isOpen={isContractEditModalOpen}
          onClose={() => {
            setIsContractEditModalOpen(false);
            setSelectedContract(null);
          }}
          onEditSuccess={() => {
            setIsContractEditModalOpen(false);
            setSelectedContract(null);
            refetchContracts();
          }}
          providers={providers}
          buildings={buildings}
          contract={selectedContract}
          updateContractStatus={updateContractStatus}
        />

        {/* Modal de renommage de document */}
        <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renommer le document</DialogTitle>
              <DialogDescription>
                Modifiez le nom du document ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="document-name">Nom du document</Label>
              <Input
                id="document-name"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
                className="mt-2"
                placeholder="Nom du document"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleRenameDocument}
                disabled={!newDocumentName.trim() || newDocumentName === documentToRename?.original_filename}
              >
                Renommer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de renommage de contrat */}
        <Dialog open={isContractRenameModalOpen} onOpenChange={setIsContractRenameModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renommer le contrat</DialogTitle>
              <DialogDescription>
                Modifiez le nom du contrat ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="contract-name">Nom du contrat</Label>
              <Input
                id="contract-name"
                value={newContractName}
                onChange={(e) => setNewContractName(e.target.value)}
                className="mt-2"
                placeholder="Nom du contrat"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContractRenameModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleRenameContract}
                disabled={!newContractName.trim() || newContractName === contractToRename?.original_filename}
              >
                Renommer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}