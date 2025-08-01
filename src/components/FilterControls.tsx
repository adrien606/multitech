import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Filter, X } from 'lucide-react';
import { Building } from '@/hooks/useBuildings';

interface FilterControlsProps {
  buildings: Building[];
  selectedBuilding: string;
  selectedStatus: string;
  onBuildingChange: (building: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  controlsCount: number;
  totalControls: number;
}

export function FilterControls({
  buildings,
  selectedBuilding,
  selectedStatus,
  onBuildingChange,
  onStatusChange,
  onClearFilters,
  controlsCount,
  totalControls,
}: FilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = selectedBuilding !== 'all' || selectedStatus !== 'all';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {controlsCount} / {totalControls} contrôles
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {isOpen ? 'Masquer' : 'Afficher'} filtres
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par bâtiment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bâtiment</label>
              <Select value={selectedBuilding} onValueChange={onBuildingChange}>
                <SelectTrigger className="bg-background">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Tous les bâtiments" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">Tous les bâtiments</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{building.name}</span>
                        <span className="text-xs text-muted-foreground">{building.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par statut */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par échéance */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Échéance</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Toutes les échéances" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">Toutes les échéances</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                {selectedBuilding !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {buildings.find(b => b.id === selectedBuilding)?.name}
                    <button
                      onClick={() => onBuildingChange('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedStatus === 'pending' && 'En attente'}
                    {selectedStatus === 'in_progress' && 'En cours'}
                    {selectedStatus === 'completed' && 'Terminé'}
                    {selectedStatus === 'overdue' && 'En retard'}
                    <button
                      onClick={() => onStatusChange('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}