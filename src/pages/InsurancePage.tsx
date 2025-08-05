import { useState } from 'react';
import { Plus, Shield, Building2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navigation from '@/components/Navigation';

interface InsuranceDocument {
  id: string;
  buildingName: string;
  documentType: 'attestation' | 'control';
  fileName: string;
  uploadDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
}

interface ClientInspection {
  id: string;
  clientName: string;
  buildingName: string;
  inspectionDate: string;
  equipments: {
    extincteurs: boolean;
    alarme: boolean;
    eclairage: boolean;
    ventilation: boolean;
  };
  status: 'conforme' | 'non-conforme' | 'en-attente';
  notes: string;
}

const InsurancePage = () => {
  const [insuranceDocs] = useState<InsuranceDocument[]>([
    {
      id: '1',
      buildingName: 'Bâtiment A - Paris 15',
      documentType: 'attestation',
      fileName: 'attestation_assurance_2024.pdf',
      uploadDate: '2024-01-15',
      expiryDate: '2024-12-31',
      status: 'valid'
    },
    {
      id: '2',
      buildingName: 'Bâtiment B - Lyon',
      documentType: 'control',
      fileName: 'controle_securite_2024.pdf',
      uploadDate: '2024-02-10',
      expiryDate: '2024-11-30',
      status: 'expiring'
    }
  ]);

  const [clientInspections] = useState<ClientInspection[]>([
    {
      id: '1',
      clientName: 'SARL Dupont',
      buildingName: 'Bâtiment A - Paris 15',
      inspectionDate: '2024-01-20',
      equipments: {
        extincteurs: true,
        alarme: true,
        eclairage: false,
        ventilation: true
      },
      status: 'non-conforme',
      notes: 'Éclairage de sécurité défaillant'
    },
    {
      id: '2',
      clientName: 'SAS Martin',
      buildingName: 'Bâtiment B - Lyon',
      inspectionDate: '2024-01-25',
      equipments: {
        extincteurs: true,
        alarme: true,
        eclairage: true,
        ventilation: true
      },
      status: 'conforme',
      notes: 'Tous les équipements sont conformes'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
      case 'conforme':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Valide</Badge>;
      case 'expiring':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expire bientôt</Badge>;
      case 'expired':
      case 'non-conforme':
        return <Badge variant="destructive">Non conforme</Badge>;
      case 'en-attente':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEquipmentIcon = (isCompliant: boolean) => {
    return isCompliant ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gestion des Assurances</h1>
              <p className="text-muted-foreground">
                Attestations d'assurance et relevés de conformité par bâtiment
              </p>
            </div>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau document
          </Button>
        </div>

        <Tabs defaultValue="attestations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attestations" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Attestations d'assurance</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Relevés clients</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attestations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Attestations par bâtiment</span>
                </CardTitle>
                <CardDescription>
                  Gérez les attestations d'assurance et documents de contrôle pour chaque bâtiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bâtiment</TableHead>
                      <TableHead>Type de document</TableHead>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Date d'upload</TableHead>
                      <TableHead>Date d'expiration</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insuranceDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.buildingName}</TableCell>
                        <TableCell>
                          <Badge variant={doc.documentType === 'attestation' ? 'default' : 'secondary'}>
                            {doc.documentType === 'attestation' ? 'Attestation' : 'Contrôle'}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.fileName}</TableCell>
                        <TableCell>{new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{new Date(doc.expiryDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Relevés de conformité clients</h2>
                <p className="text-muted-foreground">
                  Vérification des équipements de sécurité par client
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau relevé
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Bâtiment</TableHead>
                      <TableHead>Date d'inspection</TableHead>
                      <TableHead>Extincteurs</TableHead>
                      <TableHead>Alarme</TableHead>
                      <TableHead>Éclairage</TableHead>
                      <TableHead>Ventilation</TableHead>
                      <TableHead>Statut global</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-medium">{inspection.clientName}</TableCell>
                        <TableCell>{inspection.buildingName}</TableCell>
                        <TableCell>{new Date(inspection.inspectionDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{getEquipmentIcon(inspection.equipments.extincteurs)}</TableCell>
                        <TableCell>{getEquipmentIcon(inspection.equipments.alarme)}</TableCell>
                        <TableCell>{getEquipmentIcon(inspection.equipments.eclairage)}</TableCell>
                        <TableCell>{getEquipmentIcon(inspection.equipments.ventilation)}</TableCell>
                        <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Équipements à vérifier</CardTitle>
                <CardDescription>
                  Liste des équipements de sécurité à contrôler lors des inspections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Extincteurs</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Système d'alarme</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Éclairage de sécurité</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Ventilation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InsurancePage;