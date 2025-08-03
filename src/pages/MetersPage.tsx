import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Zap, Building as BuildingIcon, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useBuildings } from "@/hooks/useBuildings";
import { toast } from "sonner";

interface MeterReading {
  id: string;
  month: string;
  year: number;
  kwh: number;
}

export default function MetersPage() {
  const { buildings, loading } = useBuildings();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [newReading, setNewReading] = useState({ month: '', year: new Date().getFullYear(), kwh: 0 });

  // Mock: filtrer les bâtiments avec refacturation client = true
  const billingBuildings = buildings.filter(building => 
    // Pour l'instant, on simule avec tous les bâtiments. Après Supabase, on utilisera building.client_billing
    true
  );

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  const handleAddReading = () => {
    if (!newReading.month || !newReading.kwh) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const reading: MeterReading = {
      id: Date.now().toString(),
      month: newReading.month,
      year: newReading.year,
      kwh: newReading.kwh
    };

    setMeterReadings(prev => [...prev, reading]);
    setNewReading({ month: '', year: new Date().getFullYear(), kwh: 0 });
    toast.success("Relevé ajouté avec succès");
  };

  const handleSaveReadings = () => {
    // Ici on sauvegardera en base plus tard
    toast.success("Relevés sauvegardés avec succès");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/regulatory-controls">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Compteurs Électriques</h1>
                <p className="text-muted-foreground mt-1">
                  Gestion des relevés de compteurs pour refacturation client
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {!selectedBuildingId ? (
          // Vue principale - Liste des bâtiments avec refacturation
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Bâtiments avec refacturation client ({billingBuildings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingBuildings.length > 0 ? (
                  <div className="grid gap-4">
                    {billingBuildings.map((building) => (
                      <Card key={building.id} className="cursor-pointer transition-all hover:shadow-md"
                            onClick={() => setSelectedBuildingId(building.id)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <BuildingIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{building.name}</h3>
                                <p className="text-sm text-muted-foreground">{building.address}</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Refacturation: Oui
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucun bâtiment avec refacturation client</p>
                    <p className="text-sm">Configurez la refacturation dans la gestion des bâtiments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          // Vue détail - Gestion des relevés pour un bâtiment
          <>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedBuildingId(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux compteurs
              </Button>
              <div>
                <h2 className="text-xl font-semibold">{selectedBuilding?.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedBuilding?.address}</p>
              </div>
            </div>

            {/* Ajouter un nouveau relevé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouveau relevé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Mois</Label>
                    <select 
                      id="month"
                      className="w-full p-2 border rounded-md"
                      value={newReading.month}
                      onChange={(e) => setNewReading(prev => ({ ...prev, month: e.target.value }))}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="01">Janvier</option>
                      <option value="02">Février</option>
                      <option value="03">Mars</option>
                      <option value="04">Avril</option>
                      <option value="05">Mai</option>
                      <option value="06">Juin</option>
                      <option value="07">Juillet</option>
                      <option value="08">Août</option>
                      <option value="09">Septembre</option>
                      <option value="10">Octobre</option>
                      <option value="11">Novembre</option>
                      <option value="12">Décembre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Année</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newReading.year}
                      onChange={(e) => setNewReading(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      min="2020"
                      max="2030"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kwh">kWh à refacturer</Label>
                    <Input
                      id="kwh"
                      type="number"
                      value={newReading.kwh}
                      onChange={(e) => setNewReading(prev => ({ ...prev, kwh: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddReading} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tableau des relevés */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Relevés mensuels</CardTitle>
                  {meterReadings.length > 0 && (
                    <Button onClick={handleSaveReadings}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {meterReadings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead>Année</TableHead>
                        <TableHead className="text-right">kWh à refacturer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meterReadings.map((reading) => (
                        <TableRow key={reading.id}>
                          <TableCell>
                            {new Date(2024, parseInt(reading.month) - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </TableCell>
                          <TableCell>{reading.year}</TableCell>
                          <TableCell className="text-right font-mono">
                            {reading.kwh.toLocaleString('fr-FR')} kWh
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun relevé enregistré pour ce bâtiment</p>
                    <p className="text-sm">Ajoutez votre premier relevé ci-dessus.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}