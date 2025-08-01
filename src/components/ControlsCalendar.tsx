import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface RegulatoryControl {
  id: string;
  building_name: string;
  control_type_name: string;
  due_date: string;
  status: string;
}

interface ControlsCalendarProps {
  controls: RegulatoryControl[];
}

export function ControlsCalendar({ controls }: ControlsCalendarProps) {
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
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
              className={`min-h-[120px] p-2 border border-border ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/50'
              } ${isToday ? 'ring-2 ring-primary' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-primary font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayControls.slice(0, 3).map((control) => (
                  <div
                    key={control.id}
                    className={`text-xs p-1 rounded border ${getStatusColor(control.status)} truncate`}
                    title={`${control.control_type_name} - ${control.building_name}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(control.status)}
                      <span className="truncate">{control.control_type_name}</span>
                    </div>
                  </div>
                ))}
                {dayControls.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayControls.length - 3} autre(s)
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
              className={`min-h-[400px] p-3 border border-border bg-background ${
                isToday ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`text-lg font-medium mb-3 ${
                isToday ? 'text-primary font-bold' : 'text-foreground'
              }`}>
                {format(day, 'EEE d', { locale: fr })}
              </div>
              
              <div className="space-y-2">
                {dayControls.map((control) => (
                  <div
                    key={control.id}
                    className={`text-sm p-2 rounded border ${getStatusColor(control.status)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(control.status)}
                      <span className="font-medium">{control.control_type_name}</span>
                    </div>
                    <div className="text-xs">{control.building_name}</div>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendrier des contrôles
            </CardTitle>
            <CardDescription>
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
              <TabsList>
                <TabsTrigger value="month">Mois</TabsTrigger>
                <TabsTrigger value="week">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Aujourd'hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </CardContent>
    </Card>
  );
}