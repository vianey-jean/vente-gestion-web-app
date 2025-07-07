
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import CalendarDayHeader from './CalendarDayHeader';

interface Appointment {
  id: string;
  titre: string;
  date: string;
  heure: string;
  status: string;
}

interface WeekCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  appointments,
  onAppointmentClick,
  currentWeek,
  onWeekChange
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.date), day)
    );
  };

  const previousWeek = () => onWeekChange(subWeeks(currentWeek, 1));
  const nextWeek = () => onWeekChange(addWeeks(currentWeek, 1));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Semaine du {format(weekStart, 'd MMMM', { locale: fr })} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 border rounded-lg overflow-hidden">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="min-h-[120px] border-r last:border-r-0">
              <CalendarDayHeader day={day} />
              <div className="p-2 space-y-1">
                {getAppointmentsForDay(day).map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => onAppointmentClick(appointment)}
                    className="text-xs p-1 bg-primary text-primary-foreground rounded cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <div className="font-medium truncate">{appointment.heure}</div>
                    <div className="truncate">{appointment.titre}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekCalendar;
