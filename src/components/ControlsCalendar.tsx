import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Obtenir les contrôles pour la date sélectionnée
  const getControlsForDate = (date: Date) => {
    return controls.filter(control => 
      isSameDay(new Date(control.due_date), date)
    );
  };

  // Obtenir les dates qui ont des contrôles
  const getDatesWithControls = () => {
    return controls.map(control => new Date(control.due_date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'overdue': return 'En retard';
      default: return 'En attente';
    }
  };

  const controlsForSelectedDate = selectedDate ? getControlsForDate(selectedDate) : [];
  const datesWithControls = getDatesWithControls();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendrier des contrôles
          </CardTitle>
          <CardDescription>
            Cliquez sur une date pour voir les contrôles prévus
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border pointer-events-auto"
            locale={fr}
            modifiers={{
              hasControls: datesWithControls
            }}
            modifiersStyles={{
              hasControls: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '4px'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Détails des contrôles pour la date sélectionnée */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Aucune date sélectionnée'}
          </CardTitle>
          <CardDescription>
            {controlsForSelectedDate.length} contrôle(s) prévu(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {controlsForSelectedDate.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {controlsForSelectedDate.map((control) => (
                  <div key={control.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(control.status)}`} />
                      <div>
                        <p className="font-medium">{control.control_type_name}</p>
                        <p className="text-sm text-muted-foreground">{control.building_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={control.status === 'completed' ? 'default' : 'secondary'}>
                        {getStatusIcon(control.status)}
                        <span className="ml-1">{getStatusText(control.status)}</span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun contrôle prévu pour cette date</p>
              {selectedDate && (
                <Button variant="outline" className="mt-4" size="sm">
                  Planifier un contrôle
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}