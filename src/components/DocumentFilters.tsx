import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X, CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DocumentFiltersProps {
  buildings: Array<{ id: string; name: string; address: string }>;
  providers: Array<{ id: string; name: string }>;
  controlTypes: Array<{ id: string; name: string }>;
  selectedBuilding?: string;
  selectedProvider?: string;
  selectedControlType?: string;
  selectedStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  onBuildingChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  onControlTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function DocumentFilters({
  buildings,
  providers,
  controlTypes,
  selectedBuilding,
  selectedProvider,
  selectedControlType,
  selectedStatus,
  dateFrom,
  dateTo,
  onBuildingChange,
  onProviderChange,
  onControlTypeChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  filteredCount,
  totalCount,
}: DocumentFiltersProps) {
  const activeFiltersCount = [
    selectedBuilding,
    selectedProvider,
    selectedControlType,
    selectedStatus,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const statusOptions = [
    { value: 'pending', label: 'En attente', color: 'bg-orange-100 text-orange-800' },
    { value: 'validated', label: 'Validé', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejeté', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {filteredCount} sur {totalCount} documents
            </span>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Filtre par bâtiment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bâtiment</label>
            <Select value={selectedBuilding || 'all'} onValueChange={(value) => onBuildingChange(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les bâtiments" />
              </SelectTrigger>
              <SelectContent>
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

          {/* Filtre par prestataire */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Prestataire</label>
            <Select value={selectedProvider || 'all'} onValueChange={(value) => onProviderChange(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les prestataires" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prestataires</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par type de contrôle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Type de contrôle</label>
            <Select value={selectedControlType || 'all'} onValueChange={(value) => onControlTypeChange(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {controlTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par statut */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Statut</label>
            <Select value={selectedStatus || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre date de début */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date de début</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={onDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtre date de fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date de fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={onDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {selectedBuilding && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Bâtiment: {buildings.find(b => b.id === selectedBuilding)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onBuildingChange('')} />
              </Badge>
            )}
            {selectedProvider && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Prestataire: {providers.find(p => p.id === selectedProvider)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onProviderChange('')} />
              </Badge>
            )}
            {selectedControlType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {controlTypes.find(t => t.id === selectedControlType)?.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onControlTypeChange('')} />
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Statut: {statusOptions.find(s => s.value === selectedStatus)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onStatusChange('')} />
              </Badge>
            )}
            {dateFrom && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Depuis: {format(dateFrom, "dd/MM/yyyy", { locale: fr })}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onDateFromChange(undefined)} />
              </Badge>
            )}
            {dateTo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Jusqu'au: {format(dateTo, "dd/MM/yyyy", { locale: fr })}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onDateToChange(undefined)} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}