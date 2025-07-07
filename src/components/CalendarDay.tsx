
import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CalendarAppointment from './CalendarAppointment';

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

interface CalendarDayProps {
  day: Date;
  appointments: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
  isLoading?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  appointments, 
  onAppointmentSelect,
  isLoading = false 
}) => {
  const isCurrentDay = isToday(day);

  return (
    <div className={`border-r last:border-r-0 border-b min-h-[200px] p-2 transition-all duration-200 ${
      isCurrentDay 
        ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
    }`}>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucun rendez-vous</p>
              </div>
            </div>
          ) : (
            appointments.map((appointment) => (
              <CalendarAppointment
                key={appointment.id}
                appointment={appointment}
                onClick={() => onAppointmentSelect?.(appointment)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
