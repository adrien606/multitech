import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Zap, Building as BuildingIcon, Save, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useBuildings } from "@/hooks/useBuildings";
import { useMeters, MeterReading, MeterLot } from "@/hooks/useMeters";
import { toast } from "sonner";

export default function MetersPage() {
  const { buildings, loading } = useBuildings();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [newReading, setNewReading] = useState({ currentReading: 0 });
  const [editingLotName, setEditingLotName] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [addingPreviousReading, setAddingPreviousReading] = useState<string | null>(null);
  const [previousReadingValue, setPreviousReadingValue] = useState(0);

  const {
    meterConfig,
    lots,
    isLoading: isLoadingMeters,
    initBuildingConfig,
    initDefaultLots,
    updatePrice,
    addLot,
    updateLot,
    deleteLot,
    addReading,
    updateReading
  } = useMeters(selectedBuildingId || undefined);


  // Initialiser les données Supabase quand un bâtiment est sélectionné
  useEffect(() => {
    if (selectedBuildingId) {
      initBuildingConfig.mutate(selectedBuildingId);
      initDefaultLots.mutate(selectedBuildingId);
    }
  }, [selectedBuildingId]);

  // Filtrer les bâtiments avec refacturation client = true
  const billingBuildings = buildings.filter(building => 
    building.client_billing_enabled
  );

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const currentPricePerKwh = meterConfig?.price_per_kwh || 0.15;

  // Obtenir le mois/année actuels
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();

  // Obtenir le dernier relevé pour un lot
  const getLastReading = (lotId: string): number => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot || lot.readings.length === 0) return 0;
    return lot.readings[lot.readings.length - 1].current_reading;
  };

  // Vérifier si le relevé du mois existe déjà
  const hasCurrentMonthReading = (lotId: string): boolean => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return false;
    return lot.readings.some(r => r.month === currentMonth && r.year === currentYear);
  };

  const handleAddReading = async () => {
    if (!newReading.currentReading || !selectedLotId || !selectedBuildingId) {
      toast.error("Veuillez saisir le relevé actuel et sélectionner un lot");
      return;
    }

    if (hasCurrentMonthReading(selectedLotId)) {
      toast.error("Le relevé pour ce mois a déjà été saisi pour ce lot");
      return;
    }

    const previousReading = getLastReading(selectedLotId);
    const consumption = newReading.currentReading - previousReading;
    
    if (consumption < 0) {
      toast.error("Le nouveau relevé ne peut pas être inférieur au précédent");
      return;
    }

    const amount = consumption * currentPricePerKwh;
    
    try {
      await addReading.mutateAsync({
        lot_id: selectedLotId,
        month: currentMonth,
        year: currentYear,
        current_reading: newReading.currentReading,
        previous_reading: previousReading,
        consumption,
        amount
      });

      setNewReading({ currentReading: 0 });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du relevé:', error);
    }
  };

  const handleSaveReadings = () => {
    toast.success("Relevés sauvegardés avec succès");
  };

  const handleUpdateClientName = async (lotId: string, clientName: string) => {
    try {
      await updateLot.mutateAsync({
        lotId,
        updates: { client_name: clientName }
      });
      setEditingClient(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom du client:', error);
    }
  };

  const handleUpdatePrice = async (newPrice: number) => {
    if (!selectedBuildingId) return;
    
    try {
      await updatePrice.mutateAsync({
        buildingId: selectedBuildingId,
        price: newPrice
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix:', error);
    }
  };

  const handleAddLot = async () => {
    if (!selectedBuildingId) return;
    
    const newLotNumber = lots.length + 1;
    
    try {
      await addLot.mutateAsync({
        buildingId: selectedBuildingId,
        name: `Lot ${newLotNumber}`
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lot:', error);
    }
  };

  const handleUpdateLotName = async (lotId: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      await updateLot.mutateAsync({
        lotId,
        updates: { name: newName.trim() }
      });
      setEditingLotName(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom du lot:', error);
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (lot && lot.readings.length > 0) {
      if (!confirm(`Le lot "${lot.name}" contient des relevés. Êtes-vous sûr de vouloir le supprimer ?`)) {
        return;
      }
    }

    try {
      await deleteLot.mutateAsync(lotId);
      
      // Désélectionner le lot s'il était sélectionné
      if (selectedLotId === lotId) {
        setSelectedLotId(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du lot:', error);
    }
  };

  const handleAddPreviousReading = async (lotId: string) => {
    if (previousReadingValue < 0) {
      toast.error("Veuillez saisir un relevé précédent valide");
      return;
    }

    const lot = lots.find(l => l.id === lotId);
    if (!lot || lot.readings.length === 0) {
      toast.error("Aucun relevé actuel trouvé pour ce lot");
      return;
    }

    // Obtenir le premier relevé (le plus ancien)
    const firstReading = lot.readings[0];
    const newConsumption = firstReading.current_reading - previousReadingValue;
    const newAmount = newConsumption * currentPricePerKwh;

    try {
      await updateReading.mutateAsync({
        readingId: firstReading.id,
        updates: {
          previous_reading: previousReadingValue,
          consumption: newConsumption,
          amount: newAmount
        }
      });

      setAddingPreviousReading(null);
      setPreviousReadingValue(0);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du relevé précédent:', error);
    }
  };

  // Calculer les totaux mensuels
  const getMonthlyTotals = () => {
    const monthlyData: { [key: string]: { consumption: number; amount: number } } = {};
    
    lots.forEach(lot => {
      lot.readings.forEach(reading => {
        const key = `${reading.month}/${reading.year}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { consumption: 0, amount: 0 };
        }
        monthlyData[key].consumption += reading.consumption;
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

  if (loading || isLoadingMeters) {
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
                              Refacturation: {building.client_billing_enabled ? 'Activée' : 'Désactivée'}
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
                  value={currentPricePerKwh}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value) || 0;
                    handleUpdatePrice(newPrice);
                  }}
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
                          <div className="text-lg font-semibold">{data.consumption.toLocaleString('fr-FR')} kWh</div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Lots et clients</CardTitle>
                  <Button onClick={handleAddLot} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un lot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lots.map((lot) => (
                    <Card key={lot.id} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Nom du lot modifiable */}
                            {editingLotName === lot.id ? (
                              <Input
                                defaultValue={lot.name}
                                onBlur={(e) => handleUpdateLotName(lot.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateLotName(lot.id, e.currentTarget.value);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingLotName(null);
                                  }
                                }}
                                className="w-32 h-8 font-medium"
                                autoFocus
                              />
                            ) : (
                              <button
                                onClick={() => setEditingLotName(lot.id)}
                                className="font-medium hover:underline flex items-center gap-1"
                              >
                                {lot.name}
                                <Edit className="w-3 h-3 opacity-50" />
                              </button>
                            )}
                            
                            {/* Client modifiable */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Client:</span>
                              {editingClient === lot.id ? (
                                <Input
                                  defaultValue={lot.client_name}
                                  onBlur={(e) => handleUpdateClientName(lot.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateClientName(lot.id, e.currentTarget.value);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingClient(null);
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
                                  {lot.client_name || "Cliquer pour ajouter"}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             {lot.readings.length > 0 && lot.readings[0].previous_reading === 0 && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setAddingPreviousReading(lot.id);
                                   setPreviousReadingValue(0);
                                 }}
                                 className="text-blue-600 hover:text-blue-700"
                               >
                                 <Plus className="w-4 h-4 mr-1" />
                                 Relevé précédent
                               </Button>
                             )}
                             <Button
                               variant={selectedLotId === lot.id ? "default" : "outline"}
                               size="sm"
                               onClick={() => setSelectedLotId(lot.id)}
                             >
                               {selectedLotId === lot.id ? "Sélectionné" : "Sélectionner"}
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDeleteLot(lot.id)}
                               className="text-destructive hover:text-destructive"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                        </div>
                      </CardHeader>
                       {lot.readings.length > 0 && (
                         <CardContent className="pt-0">
                           <div className="text-xs text-muted-foreground">
                             Derniers relevés: {lot.readings.slice(-2).map(r => 
                               `${r.month}/${r.year}: ${r.consumption}kWh (${r.amount.toFixed(2)}€)`
                             ).join(' • ')}
                           </div>
                         </CardContent>
                       )}
                       
                       {/* Modal pour ajouter le relevé précédent */}
                       {addingPreviousReading === lot.id && (
                         <CardContent className="pt-0 border-t">
                           <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                             <h5 className="font-medium text-blue-900">Ajouter le relevé précédent</h5>
                             <div className="flex items-center gap-3">
                               <Label htmlFor={`previous-${lot.id}`} className="text-sm">
                                 Relevé précédent:
                               </Label>
                               <Input
                                 id={`previous-${lot.id}`}
                                 type="number"
                                 value={previousReadingValue}
                                 onChange={(e) => setPreviousReadingValue(parseFloat(e.target.value) || 0)}
                                 placeholder="0"
                                 className="w-32"
                                 autoFocus
                               />
                               <Button
                                 size="sm"
                                 onClick={() => handleAddPreviousReading(lot.id)}
                                 disabled={previousReadingValue < 0}
                               >
                                 Confirmer
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setAddingPreviousReading(null);
                                   setPreviousReadingValue(0);
                                 }}
                               >
                                 Annuler
                               </Button>
                             </div>
                             <p className="text-xs text-blue-700">
                               Ceci mettra à jour le premier relevé de ce lot pour calculer la vraie consommation.
                             </p>
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
                    Relevé mensuel - {new Date(currentYear, parseInt(currentMonth) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasCurrentMonthReading(selectedLotId) ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Le relevé pour ce mois a déjà été saisi pour ce lot.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                         <div className="text-center">
                           <div className="text-sm text-muted-foreground">Relevé précédent</div>
                           <div className="text-lg font-mono">{getLastReading(selectedLotId).toLocaleString('fr-FR')}</div>
                         </div>
                         <div className="text-center">
                           <div className="text-sm text-muted-foreground">Nouveau relevé</div>
                           <Input
                             type="number"
                             value={newReading.currentReading}
                             onChange={(e) => setNewReading(prev => ({ ...prev, currentReading: parseFloat(e.target.value) || 0 }))}
                            min={getLastReading(selectedLotId)}
                            step="1"
                            placeholder="Saisir le relevé"
                            className="text-center font-mono"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Consommation</div>
                          <div className="text-lg font-bold text-primary">
                            {(newReading.currentReading - getLastReading(selectedLotId)).toLocaleString('fr-FR')} kWh
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {((newReading.currentReading - getLastReading(selectedLotId)) * currentPricePerKwh).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleAddReading} 
                          disabled={newReading.currentReading <= getLastReading(selectedLotId)}
                          className="w-auto"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Enregistrer le relevé
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Historique des relevés */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historique des relevés</CardTitle>
                  {lots.some(lot => lot.readings.length > 0) && (
                    <Button onClick={handleSaveReadings}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {lots.some(lot => lot.readings.length > 0) ? (
                  <div className="space-y-6">
                    {lots
                      .filter(lot => lot.readings.length > 0)
                      .map(lot => (
                        <div key={lot.id}>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            {lot.name}
                            {lot.client_name && (
                              <span className="text-sm text-muted-foreground">- {lot.client_name}</span>
                            )}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead className="text-right">Relevé précédent</TableHead>
                                <TableHead className="text-right">Relevé actuel</TableHead>
                                <TableHead className="text-right">Consommation</TableHead>
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
                                    {reading.previous_reading.toLocaleString('fr-FR')}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {reading.current_reading.toLocaleString('fr-FR')}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-medium">
                                    {reading.consumption.toLocaleString('fr-FR')} kWh
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-medium text-green-600">
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