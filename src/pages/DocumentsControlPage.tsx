import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Calendar, Building2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function DocumentsControlPage() {
  // Mock data pour les documents
  const documents = [
    {
      id: 1,
      name: "Rapport contrôle ascenseur - Bâtiment A",
      type: "PDF",
      size: "2.3 MB",
      date: "2024-01-15",
      building: "Bâtiment Principal",
      status: "Validé"
    },
    {
      id: 2,
      name: "Certificat sécurité incendie",
      type: "PDF",
      size: "1.8 MB",
      date: "2024-01-10",
      building: "Annexe Est",
      status: "En attente"
    },
    {
      id: 3,
      name: "Contrôle électrique Q1 2024",
      type: "PDF",
      size: "3.1 MB",
      date: "2024-01-05",
      building: "Bâtiment Principal",
      status: "Validé"
    }
  ];

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
          <Button>
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
              <div className="text-2xl font-bold">{documents.length}</div>
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
                {documents.filter(d => d.status === "En attente").length}
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
                {documents.filter(d => d.status === "Validé").length}
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
              <div className="text-2xl font-bold">7.2 MB</div>
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
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {document.building}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(document.date).toLocaleDateString()}
                        </span>
                        <span>{document.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={document.status === 'Validé' ? 'default' : 'secondary'}>
                      {document.status}
                    </Badge>
                    <Badge variant="outline">{document.type}</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}