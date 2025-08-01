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
      <div className="grid grid-cols-7 gap-2 p-4 bg-gradient-to-br from-background to-muted/20 rounded-lg">
        {/* En-têtes des jours */}
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-primary bg-primary/5 rounded-lg">
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
              className={`min-h-[140px] p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                isCurrentMonth 
                  ? 'bg-card border-border hover:border-primary/30' 
                  : 'bg-muted/30 border-muted-foreground/20'
              } ${isToday ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}`}
            >
              <div className={`text-lg font-bold mb-2 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayControls.slice(0, 3).map((control) => (
                  <div
                    key={control.id}
                    className={`text-xs p-2 rounded-md border transition-all duration-200 cursor-pointer ${getStatusColor(control.status)} shadow-sm`}
                    title={`${control.control_type_name} - ${control.building_name}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(control.status)}
                      <span className="truncate font-medium">{control.control_type_name}</span>
                    </div>
                  </div>
                ))}
                {dayControls.length > 3 && (
                  <div className="text-xs text-primary font-medium bg-primary/10 p-1 rounded text-center">
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
      <div className="grid grid-cols-7 gap-3 p-4 bg-gradient-to-br from-background to-muted/20 rounded-lg">
        {weekDays.map((day) => {
          const dayControls = getControlsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[450px] p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                isToday 
                  ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary' 
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <div className={`text-xl font-bold mb-4 pb-2 border-b ${
                isToday ? 'text-primary border-primary/30' : 'text-foreground border-border'
              }`}>
                {format(day, 'EEE d', { locale: fr })}
              </div>
              
              <div className="space-y-3">
                {dayControls.map((control) => (
                  <div
                    key={control.id}
                    className={`text-sm p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${getStatusColor(control.status)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(control.status)}
                      <span className="font-semibold">{control.control_type_name}</span>
                    </div>
                    <div className="text-xs opacity-75">{control.building_name}</div>
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
    <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-card via-card to-muted/30">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6 text-primary" />
              Calendrier des contrôles
            </CardTitle>
            <CardDescription className="text-base font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
              <TabsList className="bg-primary/10">
                <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Mois</TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                className="hover:bg-primary/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="hover:bg-primary/10 font-medium"
              >
                Aujourd'hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                className="hover:bg-primary/10"
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