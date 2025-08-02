import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RegulatoryControl } from '@/types/regulatory-controls';

interface ControlsCalendarProps {
  controls: RegulatoryControl[];
  onControlClick?: (controlId: string) => void;
}

export function ControlsCalendar({ controls, onControlClick }: ControlsCalendarProps) {
  console.log('ControlsCalendar rendered with controls:', controls.length);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Obtenir les contrôles pour une date donnée
  const getControlsForDate = (date: Date) => {
    return controls.filter(control => 
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
                    title={`${control.control_type_name} - ${control.building_name}`}
                    onClick={() => onControlClick?.(control.id)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(control.status)}
                      <span className="truncate text-xs">{control.control_type_name}</span>
                    </div>
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
                  </div>
                ))}
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
              {format(currentDate, 'MMMM yyyy')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
              <TabsList>
                <TabsTrigger value="month" className="text-xs">Mois</TabsTrigger>
                <TabsTrigger value="week" className="text-xs">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
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
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </CardContent>
    </Card>
  );
}