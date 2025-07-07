
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CalendarDayHeader from './CalendarDayHeader';
import CalendarDay from './CalendarDay';
import CalendarHeader from './CalendarHeader';

interface Appointment {
  id: string;
  titre: string;
  date: string;
  heure: string;
  duree: number;
  description: string;
  client: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface WeekCalendarProps {
  onAppointmentSelect?: (appointment: Appointment) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ onAppointmentSelect }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculer les jours de la semaine
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadAppointments();
  }, [currentWeek]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par un appel API réel
      await new Promise(resolve => setTimeout(resolve, 500));
      setAppointments([]);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="w-full space-y-4">
      <CalendarHeader
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, index) => (
              <CalendarDayHeader key={index} day={day} />
            ))}
          </div>

          {/* Corps du calendrier */}
          <div className="grid grid-cols-7 min-h-[600px]">
            {weekDays.map((day, index) => {
              const dayAppointments = appointments.filter(apt => 
                format(new Date(apt.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );

              return (
                <CalendarDay
                  key={index}
                  day={day}
                  appointments={dayAppointments}
                  onAppointmentSelect={onAppointmentSelect}
                  isLoading={isLoading}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeekCalendar;
