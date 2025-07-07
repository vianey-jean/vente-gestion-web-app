
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Clock, User } from 'lucide-react';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentSelectModalProps {
  onSelect: (appointment: Appointment) => void;
  onCancel: () => void;
  isDeleteMode?: boolean;
}

const AppointmentSelectModal: React.FC<AppointmentSelectModalProps> = ({ 
  onSelect, 
  onCancel,
  isDeleteMode = false 
}) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      if (selectedDate) {
        const endDate = selectedDate;
        const data = await appointmentService.getAppointmentsByWeek(selectedDate, endDate);
        setAppointments(data.filter(apt => apt.date === selectedDate));
      } else {
        const data = await appointmentService.getAppointments();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter(apt =>
      apt.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppointments(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Date and Search Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => onSelect(appointment)}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{appointment.titre}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>à {appointment.heure}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{appointment.client}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun rendez-vous trouvé pour cette date</p>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
          ← Annuler
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSelectModal;
