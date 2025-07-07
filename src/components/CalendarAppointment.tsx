
import React from 'react';
import { Clock, User, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface CalendarAppointmentProps {
  appointment: Appointment;
  onClick?: () => void;
}

const CalendarAppointment: React.FC<CalendarAppointmentProps> = ({ 
  appointment, 
  onClick 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return null;
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${getStatusColor(appointment.status)}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-semibold text-sm truncate flex-1 mr-1">
          {appointment.titre}
        </h4>
        {getStatusIcon(appointment.status)}
      </div>
      
      <div className="flex items-center gap-1 text-xs mb-1">
        <Clock className="h-3 w-3" />
        <span>{appointment.heure}</span>
        <span className="text-gray-500">({appointment.duree}min)</span>
      </div>
      
      <div className="flex items-center gap-1 text-xs mb-2">
        <User className="h-3 w-3" />
        <span className="truncate">{appointment.client}</span>
      </div>
      
      {appointment.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {appointment.description}
        </p>
      )}
    </div>
  );
};

export default CalendarAppointment;
