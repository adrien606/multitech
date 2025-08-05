import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addDays, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfYear, endOfYear, getQuarter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RegulatoryControl } from '@/types/regulatory-controls';
import { Building } from '@/hooks/useBuildings';

interface ControlsCalendarProps {
  controls: RegulatoryControl[];
  buildings: Building[];
  onControlClick?: (controlId: string) => void;
}

export function ControlsCalendar({ controls, buildings, onControlClick }: ControlsCalendarProps) {
  console.log('ControlsCalendar rendered with controls:', controls.length);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'quarter' | 'year'>('month');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');

  // Filtrer les contrôles par bâtiment
  const filteredControls = selectedBuildingId === 'all' 
    ? controls 
    : controls.filter(control => control.building_id === selectedBuildingId);

  // Obtenir les contrôles pour une date donnée
  const getControlsForDate = (date: Date) => {
    return filteredControls.filter(control => 
      isSameDay(new Date(control.due_date), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'overdue': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateQuarter = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 3);
    } else {
      newDate.setMonth(currentDate.getMonth() + 3);
    }
    setCurrentDate(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  // Vue mois
  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {/* Jours du mois */}
        {days.map((day) => {
          const dayControls = getControlsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-1 border-b border-r border-border transition-colors hover:bg-muted/30 ${
                !isCurrentMonth ? 'bg-muted/10' : ''
              } ${isToday ? 'bg-primary/5' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-primary font-semibold' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-0.5">
                {dayControls.slice(0, 2).map((control) => (
                  <div
                    key={control.id}
                    className={`text-xs px-1 py-0.5 rounded cursor-pointer ${getStatusColor(control.status)}`}
                    title={`${control.control_type_name} - ${control.building_name} - ${control.provider_name || 'Aucun prestataire'}`}
                    onClick={() => onControlClick?.(control.id)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(control.status)}
                      <span className="truncate text-xs">{control.control_type_name}</span>
                    </div>
                    {control.provider_name && (
                      <div className="text-xs opacity-60 truncate mt-0.5">{control.provider_name}</div>
                    )}
                  </div>
                ))}
                {dayControls.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayControls.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Vue semaine
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const dayControls = getControlsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[300px] p-2 border-r border-border transition-colors hover:bg-muted/30 ${
                isToday ? 'bg-primary/5' : ''
              }`}
            >
              <div className={`text-sm font-semibold mb-2 pb-1 border-b border-border ${
                isToday ? 'text-primary' : 'text-foreground'
              }`}>
                {format(day, 'EEE d')}
              </div>
              
              <div className="space-y-1">
                {dayControls.map((control) => (
                  <div
                    key={control.id}
                    className={`text-xs p-1.5 rounded cursor-pointer ${getStatusColor(control.status)}`}
                    onClick={() => onControlClick?.(control.id)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {getStatusIcon(control.status)}
                      <span className="font-medium truncate">{control.control_type_name}</span>
                    </div>
                    <div className="text-xs opacity-60 truncate">{control.building_name}</div>
                    {control.provider_name && (
                      <div className="text-xs opacity-50 truncate mt-0.5">{control.provider_name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Vue trimestre
  const renderQuarterView = () => {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });
    
    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((month) => {
          const monthControls = filteredControls.filter(control => {
            const controlDate = new Date(control.due_date);
            return isSameMonth(controlDate, month);
          });
          
          return (
            <div
              key={month.toISOString()}
              className="border border-border rounded-lg p-3 min-h-[200px] hover:bg-muted/30 transition-colors"
            >
              <div className="text-lg font-semibold mb-3 pb-2 border-b border-border">
                {format(month, 'MMMM yyyy', { locale: fr })}
              </div>
              
              <div className="space-y-2">
                {monthControls.slice(0, 6).map((control) => (
                  <div
                    key={control.id}
                    className={`text-xs p-2 rounded cursor-pointer ${getStatusColor(control.status)}`}
                    onClick={() => onControlClick?.(control.id)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {getStatusIcon(control.status)}
                      <span className="font-medium truncate">{control.control_type_name}</span>
                    </div>
                    <div className="text-xs opacity-60 truncate">{control.building_name}</div>
                    <div className="text-xs opacity-50 truncate mt-0.5">
                      {format(new Date(control.due_date), 'd MMM', { locale: fr })}
                    </div>
                  </div>
                ))}
                {monthControls.length > 6 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{monthControls.length - 6} autres
                  </div>
                )}
                {monthControls.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                    Aucun contrôle ce mois
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Vue année
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return (
      <div className="grid grid-cols-4 gap-3">
        {months.map((month) => {
          const monthControls = filteredControls.filter(control => {
            const controlDate = new Date(control.due_date);
            return isSameMonth(controlDate, month);
          });
          
          const completedCount = monthControls.filter(c => c.status === 'completed').length;
          const overdueCount = monthControls.filter(c => c.status === 'overdue').length;
          const inProgressCount = monthControls.filter(c => c.status === 'in_progress').length;
          const pendingCount = monthControls.filter(c => c.status === 'pending').length;
          
          return (
            <div
              key={month.toISOString()}
              className="border border-border rounded-lg p-3 min-h-[150px] hover:bg-muted/30 transition-colors"
            >
              <div className="text-sm font-semibold mb-2 pb-1 border-b border-border">
                {format(month, 'MMM yyyy', { locale: fr })}
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Total: {monthControls.length} contrôles
                </div>
                
                {monthControls.length > 0 && (
                  <div className="space-y-1">
                    {completedCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">{completedCount} terminés</span>
                      </div>
                    )}
                    {overdueCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span className="text-red-600">{overdueCount} en retard</span>
                      </div>
                    )}
                    {inProgressCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-600">{inProgressCount} en cours</span>
                      </div>
                    )}
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span className="text-amber-600">{pendingCount} en attente</span>
                      </div>
                    )}
                  </div>
                )}
                
                {monthControls.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Aucun contrôle
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  console.log('Rendering calendar with controls:', controls.length);
  
  return (
    <Card className="overflow-hidden border">
      <CardHeader className="border-b bg-background pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              Calendrier des contrôles
            </CardTitle>
            <CardDescription className="text-sm">
              {viewMode === 'quarter' 
                ? `T${getQuarter(currentDate)} ${format(currentDate, 'yyyy')}`
                : viewMode === 'year'
                ? format(currentDate, 'yyyy')
                : format(currentDate, 'MMMM yyyy', { locale: fr })
              }
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-56">
              <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Filtrer par bâtiment" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex flex-col">
                      <span className="font-medium">Tous les bâtiments</span>
                      <span className="text-xs text-muted-foreground">Afficher tous les contrôles</span>
                    </div>
                  </SelectItem>
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
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'quarter' | 'year')}>
              <TabsList>
                <TabsTrigger value="month" className="text-xs">Mois</TabsTrigger>
                <TabsTrigger value="week" className="text-xs">Semaine</TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs">Trimestre</TabsTrigger>
                <TabsTrigger value="year" className="text-xs">Année</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (viewMode === 'month') navigateMonth('prev');
                  else if (viewMode === 'week') navigateWeek('prev');
                  else if (viewMode === 'quarter') navigateQuarter('prev');
                  else if (viewMode === 'year') navigateYear('prev');
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-xs px-2"
              >
                Aujourd'hui
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (viewMode === 'month') navigateMonth('next');
                  else if (viewMode === 'week') navigateWeek('next');
                  else if (viewMode === 'quarter') navigateQuarter('next');
                  else if (viewMode === 'year') navigateYear('next');
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {viewMode === 'month' ? renderMonthView() : 
         viewMode === 'week' ? renderWeekView() :
         viewMode === 'quarter' ? renderQuarterView() :
         renderYearView()}
      </CardContent>
    </Card>
  );
}