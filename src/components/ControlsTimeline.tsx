import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Control {
  id: string;
  control_type_name: string;
  building_name: string;
  due_date: string;
  status: string;
}

interface ControlsTimelineProps {
  controls: Control[];
  onControlClick?: (controlId: string) => void;
}

type ViewMode = 'week' | 'month';

// Fonctions utilitaires simplifiées
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getDaysInWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

const getWeeksInMonth = (date: Date) => {
  const start = getStartOfMonth(date);
  const end = getEndOfMonth(date);
  const weeks = [];
  let current = getStartOfWeek(start);
  
  while (current <= end) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

const isDateInWeek = (date: Date, weekStart: Date) => {
  const weekEnd = getEndOfWeek(weekStart);
  return date >= weekStart && date <= weekEnd;
};

const formatDate = (date: Date, format: string) => {
  const options: any = {};
  if (format.includes('EEE')) options.weekday = 'short';
  if (format.includes('d')) options.day = 'numeric';
  if (format.includes('MMM')) options.month = 'short';
  if (format.includes('yyyy')) options.year = 'numeric';
  
  return date.toLocaleDateString('fr-FR', options);
};

export const ControlsTimeline: React.FC<ControlsTimelineProps> = ({ 
  controls, 
  onControlClick 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'overdue': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const timelineData = useMemo(() => {
    if (viewMode === 'week') {
      const days = getDaysInWeek(currentDate);

      return days.map(day => {
        const dayControls = controls.filter(control => 
          isSameDay(new Date(control.due_date), day)
        );

        return {
          date: day,
          label: formatDate(day, 'EEE d'),
          fullLabel: formatDate(day, 'EEEE d MMMM'),
          controls: dayControls,
        };
      });
    } else {
      const weeks = getWeeksInMonth(currentDate);

      return weeks.map((weekStart, index) => {
        const weekControls = controls.filter(control => {
          const controlDate = new Date(control.due_date);
          return isDateInWeek(controlDate, weekStart);
        });

        return {
          date: weekStart,
          label: `S${index + 1}`,
          fullLabel: `Semaine du ${formatDate(weekStart, 'd MMM')}`,
          controls: weekControls,
        };
      });
    }
  }, [controls, currentDate, viewMode]);

  const getCurrentPeriodLabel = () => {
    if (viewMode === 'week') {
      const weekStart = getStartOfWeek(currentDate);
      const weekEnd = getEndOfWeek(currentDate);
      return `${formatDate(weekStart, 'd MMM')} - ${formatDate(weekEnd, 'd MMM yyyy')}`;
    } else {
      return formatDate(currentDate, 'MMMM yyyy');
    }
  };

  const totalControls = timelineData.reduce((sum, period) => sum + period.controls.length, 0);
  const completedControls = timelineData.reduce((sum, period) => 
    sum + period.controls.filter(c => c.status === 'completed').length, 0
  );
  const inProgressControls = timelineData.reduce((sum, period) => 
    sum + period.controls.filter(c => c.status === 'in_progress').length, 0
  );
  const overdueControls = timelineData.reduce((sum, period) => 
    sum + period.controls.filter(c => c.status === 'overdue').length, 0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline des Contrôles
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="rounded-r-none"
              >
                Semaine
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="rounded-l-none"
              >
                Mois
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-medium capitalize">
            {getCurrentPeriodLabel()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Légende */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Terminé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>En cours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>En attente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>En retard</span>
            </div>
          </div>

          {/* Timeline */}
          <div className={`grid gap-4 ${viewMode === 'week' ? 'grid-cols-1 lg:grid-cols-7' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {timelineData.map((period, index) => (
              <div key={index} className="space-y-2">
                <div className="text-center">
                  <div className="text-sm font-medium">{period.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {period.fullLabel}
                  </div>
                </div>
                
                <div className="min-h-[120px] space-y-2">
                  {period.controls.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      Aucun contrôle
                    </div>
                  ) : (
                    period.controls.map((control) => (
                      <div
                        key={control.id}
                        className="p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onControlClick?.(control.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(control.status)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {control.control_type_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {control.building_name}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs px-1 py-0 h-auto">
                                {getStatusIcon(control.status)}
                                <span className="ml-1 capitalize">{control.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Statistiques de la période */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Statistiques de la période</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold">{totalControls}</div>
                <div className="text-muted-foreground">Total contrôles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedControls}</div>
                <div className="text-muted-foreground">Terminés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressControls}</div>
                <div className="text-muted-foreground">En cours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{overdueControls}</div>
                <div className="text-muted-foreground">En retard</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};