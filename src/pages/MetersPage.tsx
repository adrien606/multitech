import { useState, useEffect } from "react";
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
  amount: number;
}

interface Lot {
  id: string;
  name: string;
  clientName: string;
  readings: MeterReading[];
}

interface BuildingLots {
  [buildingId: string]: {
    lots: Lot[];
    pricePerKwh: number;
  };
}

export default function MetersPage() {
  const { buildings, loading } = useBuildings();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildingsBilling, setBuildingsBilling] = useState<Record<string, boolean>>({});
  const [buildingLots, setBuildingLots] = useState<BuildingLots>({});
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [newReading, setNewReading] = useState({ month: '', year: new Date().getFullYear(), kwh: 0 });
  const [pricePerKwh, setPricePerKwh] = useState(0.15); // Prix par défaut
  const [editingClient, setEditingClient] = useState<string | null>(null);

  // Charger les données de refacturation depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('buildingsBilling');
      if (saved) {
        setBuildingsBilling(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de refacturation:', error);
    }
  }, []);

  const getBillingStatus = (buildingId: string) => {
    return buildingsBilling[buildingId] || false;
  };

  // Mock: filtrer les bâtiments avec refacturation client = true
  const billingBuildings = buildings.filter(building => 
    getBillingStatus(building.id)
  );

  // Initialiser les lots pour un bâtiment s'ils n'existent pas
  const initializeBuildingLots = (buildingId: string) => {
    if (!buildingLots[buildingId]) {
      setBuildingLots(prev => ({
        ...prev,
        [buildingId]: {
          lots: [
            { id: '1', name: 'Lot 1', clientName: '', readings: [] },
            { id: '2', name: 'Lot 2', clientName: '', readings: [] },
            { id: '3', name: 'Lot 3', clientName: '', readings: [] }
          ],
          pricePerKwh: 0.15
        }
      }));
    }
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const currentBuildingData = selectedBuildingId ? buildingLots[selectedBuildingId] : null;

  const handleAddReading = () => {
    if (!newReading.month || !newReading.kwh || !selectedLotId || !selectedBuildingId) {
      toast.error("Veuillez remplir tous les champs et sélectionner un lot");
      return;
    }

    const amount = newReading.kwh * pricePerKwh;
    const reading: MeterReading = {
      id: Date.now().toString(),
      month: newReading.month,
      year: newReading.year,
      kwh: newReading.kwh,
      amount
    };

    setBuildingLots(prev => ({
      ...prev,
      [selectedBuildingId]: {
        ...prev[selectedBuildingId],
        lots: prev[selectedBuildingId].lots.map(lot =>
          lot.id === selectedLotId
            ? { ...lot, readings: [...lot.readings, reading] }
            : lot
        )
      }
    }));

    setNewReading({ month: '', year: new Date().getFullYear(), kwh: 0 });
    toast.success("Relevé ajouté avec succès");
  };

  const handleSaveReadings = () => {
    toast.success("Relevés sauvegardés avec succès");
  };

  const handleUpdateClientName = (lotId: string, clientName: string) => {
    if (!selectedBuildingId) return;
    
    setBuildingLots(prev => ({
      ...prev,
      [selectedBuildingId]: {
        ...prev[selectedBuildingId],
        lots: prev[selectedBuildingId].lots.map(lot =>
          lot.id === lotId ? { ...lot, clientName } : lot
        )
      }
    }));
    setEditingClient(null);
    toast.success("Nom du client mis à jour");
  };

  const handleUpdatePrice = (newPrice: number) => {
    if (!selectedBuildingId) return;
    
    setBuildingLots(prev => ({
      ...prev,
      [selectedBuildingId]: {
        ...prev[selectedBuildingId],
        pricePerKwh: newPrice
      }
    }));
    setPricePerKwh(newPrice);
    toast.success("Prix de refacturation mis à jour");
  };

  // Calculer les totaux mensuels
  const getMonthlyTotals = () => {
    if (!currentBuildingData) return [];
    
    const monthlyData: { [key: string]: { kwh: number; amount: number } } = {};
    
    currentBuildingData.lots.forEach(lot => {
      lot.readings.forEach(reading => {
        const key = `${reading.month}/${reading.year}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { kwh: 0, amount: 0 };
        }
        monthlyData[key].kwh += reading.kwh;
        monthlyData[key].amount += reading.amount;
      });
    });

    return Object.entries(monthlyData).map(([key, data]) => ({
      period: key,
      ...data
    })).sort((a, b) => {
      const [monthA, yearA] = a.period.split('/');
      const [monthB, yearB] = b.period.split('/');
      return new Date(parseInt(yearB), parseInt(monthB) - 1).getTime() - 
             new Date(parseInt(yearA), parseInt(monthA) - 1).getTime();
    });
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
                              Refacturation: {getBillingStatus(building.id) ? 'Activée' : 'Désactivée'}
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
            {(() => {
              initializeBuildingLots(selectedBuildingId);
              return null;
            })()}
            
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedBuildingId(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux compteurs
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{selectedBuilding?.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedBuilding?.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="price">Prix/kWh:</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(parseFloat(e.target.value) || 0)}
                  onBlur={() => handleUpdatePrice(pricePerKwh)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>

            {/* Timeline des totaux mensuels */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Timeline des refacturations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getMonthlyTotals().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getMonthlyTotals().map((data) => (
                      <Card key={data.period} className="text-center">
                        <CardContent className="pt-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            {new Date(2024, parseInt(data.period.split('/')[0]) - 1).toLocaleDateString('fr-FR', { month: 'long' })} {data.period.split('/')[1]}
                          </div>
                          <div className="text-lg font-semibold">{data.kwh.toLocaleString('fr-FR')} kWh</div>
                          <div className="text-sm font-medium text-green-600">{data.amount.toFixed(2)} €</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun relevé enregistré</p>
                )}
              </CardContent>
            </Card>

            {/* Gestion des lots */}
            <Card>
              <CardHeader>
                <CardTitle>Lots et clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBuildingData?.lots.map((lot) => (
                    <Card key={lot.id} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{lot.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Client:</span>
                              {editingClient === lot.id ? (
                                <Input
                                  defaultValue={lot.clientName}
                                  onBlur={(e) => handleUpdateClientName(lot.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateClientName(lot.id, e.currentTarget.value);
                                    }
                                  }}
                                  className="w-40 h-7"
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={() => setEditingClient(lot.id)}
                                  className="text-sm font-medium hover:underline min-w-[100px] text-left"
                                >
                                  {lot.clientName || "Cliquer pour ajouter"}
                                </button>
                              )}
                            </div>
                          </div>
                          <Button
                            variant={selectedLotId === lot.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedLotId(lot.id)}
                          >
                            {selectedLotId === lot.id ? "Sélectionné" : "Sélectionner"}
                          </Button>
                        </div>
                      </CardHeader>
                      {lot.readings.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="text-xs text-muted-foreground">
                            Derniers relevés: {lot.readings.slice(-3).map(r => 
                              `${r.month}/${r.year}: ${r.kwh}kWh (${r.amount.toFixed(2)}€)`
                            ).join(' • ')}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ajouter un nouveau relevé */}
            {selectedLotId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nouveau relevé pour {currentBuildingData?.lots.find(l => l.id === selectedLotId)?.name}
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
                      <Label htmlFor="kwh">kWh consommés</Label>
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
                        Ajouter ({(newReading.kwh * pricePerKwh).toFixed(2)}€)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des relevés */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historique des relevés</CardTitle>
                  {currentBuildingData?.lots.some(lot => lot.readings.length > 0) && (
                    <Button onClick={handleSaveReadings}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentBuildingData?.lots.some(lot => lot.readings.length > 0) ? (
                  <div className="space-y-6">
                    {currentBuildingData.lots
                      .filter(lot => lot.readings.length > 0)
                      .map(lot => (
                        <div key={lot.id}>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            {lot.name}
                            {lot.clientName && (
                              <span className="text-sm text-muted-foreground">- {lot.clientName}</span>
                            )}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead className="text-right">kWh</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {lot.readings.map((reading) => (
                                <TableRow key={reading.id}>
                                  <TableCell>
                                    {new Date(2024, parseInt(reading.month) - 1).toLocaleDateString('fr-FR', { month: 'long' })} {reading.year}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {reading.kwh.toLocaleString('fr-FR')} kWh
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-medium">
                                    {reading.amount.toFixed(2)} €
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun relevé enregistré</p>
                    <p className="text-sm">Sélectionnez un lot et ajoutez votre premier relevé.</p>
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