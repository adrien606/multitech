import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Zap, Building as BuildingIcon, Save, Trash2, Edit, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useBuildings } from "@/hooks/useBuildings";
import { useBillingSettings } from "@/hooks/useBillingSettings";
import { useMeterData } from "@/hooks/useMeterData";
import { useElectricalMeters } from "@/hooks/useElectricalMeters";
import { ElectricalMeterModal } from "@/components/ElectricalMeterModal";
import { toast } from "sonner";

export default function MetersPage() {
  const { buildings, loading } = useBuildings();
  const { getBillingStatus } = useBillingSettings();
  const { 
    meterData, 
    updatePrice, 
    createLot, 
    deleteLot, 
    updateLot, 
    addReading, 
    deleteReading,
    updateReading,
    isLoading: meterLoading,
    isUpdating 
  } = useMeterData();
  const {
    meters,
    getMetersByBuilding,
    createMeter,
    updateMeter,
    deleteMeter,
    isModifying
  } = useElectricalMeters();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [newReading, setNewReading] = useState({ currentReading: 0 });
  const [pricePerKwh, setPricePerKwh] = useState(0.15);
  const [editingLotName, setEditingLotName] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [addingPreviousReading, setAddingPreviousReading] = useState<string | null>(null);
  const [previousReadingValue, setPreviousReadingValue] = useState(0);
  const [meterModalOpen, setMeterModalOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<any>(null);

  // Filtrer les bâtiments avec refacturation client = true
  const billingBuildings = buildings.filter(building => 
    getBillingStatus(building.id)
  );

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const currentBuildingData = selectedBuildingId ? meterData[selectedBuildingId] : null;

  // Synchroniser le prix avec les données du bâtiment sélectionné
  useEffect(() => {
    if (selectedBuildingId) {
      const buildingMeterData = meterData[selectedBuildingId];
      if (buildingMeterData) {
        setPricePerKwh(buildingMeterData.pricePerKwh);
      }
    }
  }, [selectedBuildingId]); // Retirer meterData des dépendances pour éviter la boucle

  // Obtenir le mois/année actuels
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();

  // Obtenir le dernier relevé pour un lot
  const getLastReading = (lotId: string): number => {
    const lot = currentBuildingData?.lots.find(l => l.id === lotId);
    if (!lot || lot.readings.length === 0) return 0;
    return lot.readings[lot.readings.length - 1].currentReading;
  };

  // Vérifier si le relevé du mois existe déjà
  const hasCurrentMonthReading = (lotId: string): boolean => {
    const lot = currentBuildingData?.lots.find(l => l.id === lotId);
    if (!lot) return false;
    return lot.readings.some(r => r.month === currentMonth && r.year === currentYear);
  };

  const handleAddReading = () => {
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

    addReading({
      lotId: selectedLotId,
      month: currentMonth,
      year: currentYear,
      currentReading: newReading.currentReading,
      previousReading,
      pricePerKwh
    });

    setNewReading({ currentReading: 0 });
  };

  const handleUpdateClientName = (lotId: string, clientName: string) => {
    updateLot({ lotId, clientName });
    setEditingClient(null);
  };

  const handleUpdatePrice = (newPrice: number) => {
    if (!selectedBuildingId) return;
    updatePrice({ buildingId: selectedBuildingId, pricePerKwh: newPrice });
  };

  const handleAddLot = () => {
    if (!selectedBuildingId) return;
    
    const existingLots = currentBuildingData?.lots || [];
    const newLotNumber = existingLots.length + 1;
    
    createLot({
      buildingId: selectedBuildingId,
      name: `Lot ${newLotNumber}`,
      clientName: ''
    });
  };

  const handleUpdateLotName = (lotId: string, newName: string) => {
    if (!newName.trim()) return;
    updateLot({ lotId, name: newName.trim() });
    setEditingLotName(null);
  };

  const handleDeleteLot = (lotId: string) => {
    const lot = currentBuildingData?.lots.find(l => l.id === lotId);
    if (lot && lot.readings.length > 0) {
      if (!confirm(`Le lot "${lot.name}" contient des relevés. Êtes-vous sûr de vouloir le supprimer ?`)) {
        return;
      }
    }

    deleteLot(lotId);
    
    // Désélectionner le lot s'il était sélectionné
    if (selectedLotId === lotId) {
      setSelectedLotId(null);
    }
  };

  const handleAddPreviousReading = (readingId: string) => {
    if (previousReadingValue < 0) {
      toast.error("Veuillez saisir un relevé précédent valide");
      return;
    }

    // Trouver le relevé à mettre à jour
    const lot = currentBuildingData?.lots.find(l => 
      l.readings.some(r => r.id === readingId)
    );
    const reading = lot?.readings.find(r => r.id === readingId);
    
    if (!reading) {
      toast.error("Relevé introuvable");
      return;
    }

    const newConsumption = reading.currentReading - previousReadingValue;
    const newAmount = newConsumption * pricePerKwh;

    updateReading({
      readingId,
      previousReading: previousReadingValue,
      consumption: newConsumption,
      amount: newAmount
    });

    setAddingPreviousReading(null);
    setPreviousReadingValue(0);
  };

  // Fonctions de gestion des PDL
  const handleCreateMeter = (data: any) => {
    createMeter(data);
    setMeterModalOpen(false);
    setEditingMeter(null);
  };

  const handleUpdateMeter = (data: any) => {
    updateMeter(data);
    setMeterModalOpen(false);
    setEditingMeter(null);
  };

  const handleEditMeter = (meter: any) => {
    setEditingMeter(meter);
    setMeterModalOpen(true);
  };

  const handleDeleteMeter = (meterId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce compteur électrique ?")) {
      return;
    }
    deleteMeter(meterId);
  };

  // Calculer les totaux mensuels
  const getMonthlyTotals = () => {
    if (!currentBuildingData) return [];
    
    const monthlyData: { [key: string]: { consumption: number; amount: number } } = {};
    
    currentBuildingData.lots.forEach(lot => {
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

  if (loading || meterLoading) {
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

            {/* Gestion des PDL (Compteurs électriques) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  PDL / Compteurs électriques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {buildings.map((building) => {
                    const buildingMeters = getMetersByBuilding(building.id);
                    return (
                      <Card key={building.id} className="bg-muted/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-secondary/10">
                                <BuildingIcon className="w-5 h-5 text-secondary-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{building.name}</h3>
                                <p className="text-sm text-muted-foreground">{building.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {buildingMeters.length} compteur{buildingMeters.length !== 1 ? 's' : ''}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMeter({ building_id: building.id });
                                  setMeterModalOpen(true);
                                }}
                                disabled={isModifying}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {buildingMeters.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {buildingMeters.map((meter) => (
                                <div key={meter.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{meter.name}</h4>
                                      <span className="text-xs bg-muted px-2 py-1 rounded">
                                        {meter.meter_number}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                      {meter.pdl_number && (
                                        <span>PDL: {meter.pdl_number}</span>
                                      )}
                                      {meter.supplier && (
                                        <span>• {meter.supplier}</span>
                                      )}
                                      {meter.contract_reference && (
                                        <span>• Contrat: {meter.contract_reference}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditMeter(meter)}
                                      disabled={isModifying}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteMeter(meter.id)}
                                      className="text-destructive hover:text-destructive"
                                      disabled={isModifying}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
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
                    value={pricePerKwh}
                    onChange={(e) => setPricePerKwh(parseFloat(e.target.value) || 0)}
                    onBlur={() => handleUpdatePrice(pricePerKwh)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePrice(pricePerKwh);
                      }
                    }}
                    className="w-20"
                    disabled={isUpdating}
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
                  <Button onClick={handleAddLot} size="sm" disabled={isUpdating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un lot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBuildingData?.lots.map((lot) => (
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
                                disabled={isUpdating}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingLotName(lot.id)}
                                className="font-medium hover:underline flex items-center gap-1"
                                disabled={isUpdating}
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
                                  defaultValue={lot.clientName}
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
                                  disabled={isUpdating}
                                />
                              ) : (
                                <button
                                  onClick={() => setEditingClient(lot.id)}
                                  className="text-sm font-medium hover:underline min-w-[100px] text-left"
                                  disabled={isUpdating}
                                >
                                  {lot.clientName || "Cliquer pour ajouter"}
                                </button>
                              )}
                            </div>
                          </div>
                          
                           <div className="flex items-center gap-2">
                             <Button
                               variant={selectedLotId === lot.id ? "default" : "outline"}
                               size="sm"
                               onClick={() => setSelectedLotId(lot.id)}
                               disabled={isUpdating}
                             >
                               {selectedLotId === lot.id ? "Sélectionné" : "Sélectionner"}
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDeleteLot(lot.id)}
                               className="text-destructive hover:text-destructive"
                               disabled={isUpdating}
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
                            disabled={isUpdating}
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Consommation</div>
                          <div className="text-lg font-bold text-primary">
                            {(newReading.currentReading - getLastReading(selectedLotId)).toLocaleString('fr-FR')} kWh
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {((newReading.currentReading - getLastReading(selectedLotId)) * pricePerKwh).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleAddReading} 
                          disabled={newReading.currentReading <= getLastReading(selectedLotId) || isUpdating}
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
                <CardTitle>Historique des relevés</CardTitle>
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
                                 <TableHead className="text-right">Relevé précédent</TableHead>
                                 <TableHead className="text-right">Relevé actuel</TableHead>
                                 <TableHead className="text-right">Consommation</TableHead>
                                 <TableHead className="text-right">Montant</TableHead>
                                 <TableHead className="text-right">Actions</TableHead>
                               </TableRow>
                             </TableHeader>
                            <TableBody>
                              {lot.readings.map((reading) => (
                                <TableRow key={reading.id}>
                                  <TableCell>
                                    {new Date(2024, parseInt(reading.month) - 1).toLocaleDateString('fr-FR', { month: 'long' })} {reading.year}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {reading.previousReading.toLocaleString('fr-FR')}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {reading.currentReading.toLocaleString('fr-FR')}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-medium">
                                    {reading.consumption.toLocaleString('fr-FR')} kWh
                                  </TableCell>
                                   <TableCell className="text-right font-mono font-medium text-green-600">
                                     {reading.amount.toFixed(2)} €
                                   </TableCell>
                                   <TableCell className="text-right">
                                     {reading.previousReading === 0 ? (
                                       addingPreviousReading === reading.id ? (
                                         <div className="flex items-center gap-2 justify-end">
                                           <Input
                                             type="number"
                                             value={previousReadingValue}
                                             onChange={(e) => setPreviousReadingValue(parseFloat(e.target.value) || 0)}
                                             onKeyDown={(e) => {
                                               if (e.key === 'Enter') {
                                                 handleAddPreviousReading(reading.id);
                                               }
                                               if (e.key === 'Escape') {
                                                 setAddingPreviousReading(null);
                                                 setPreviousReadingValue(0);
                                               }
                                             }}
                                             className="w-20 h-7"
                                             placeholder="Relevé"
                                             autoFocus
                                             disabled={isUpdating}
                                           />
                                           <Button
                                             size="sm"
                                             onClick={() => handleAddPreviousReading(reading.id)}
                                             disabled={isUpdating}
                                           >
                                             <Save className="w-3 h-3" />
                                           </Button>
                                         </div>
                                       ) : (
                                         <Button
                                           variant="outline"
                                           size="sm"
                                           onClick={() => setAddingPreviousReading(reading.id)}
                                           disabled={isUpdating}
                                         >
                                           Ajouter relevé précédent
                                         </Button>
                                       )
                                     ) : null}
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

      {/* Modal pour ajouter/éditer un compteur électrique */}
      <ElectricalMeterModal
        isOpen={meterModalOpen}
        onClose={() => {
          setMeterModalOpen(false);
          setEditingMeter(null);
        }}
        meter={editingMeter && editingMeter.id ? editingMeter : undefined}
        buildingId={editingMeter?.building_id || ""}
        onSubmit={editingMeter && editingMeter.id ? handleUpdateMeter : handleCreateMeter}
        isLoading={isModifying}
      />
    </div>
  );
}