
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

interface AppointmentDetailsProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ 
  appointment, 
  onEdit,
  onDelete,
  onClose 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{appointment.titre}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500">⭐⭐⭐</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-gray-600">Détails complets du rendez-vous</p>

      {/* Date & Heure */}
      <div className="bg-purple-50 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Date & Heure</span>
        </div>
        <p className="text-purple-600 font-medium">{formatDate(appointment.date)}</p>
        <p className="text-gray-600">à {appointment.heure}</p>
      </div>

      {/* Durée */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Durée</span>
        </div>
        <p className="text-blue-600 font-medium">{appointment.duree} minutes</p>
      </div>

      {/* Lieu */}
      <div className="bg-green-50 p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Lieu</span>
        </div>
        <p className="text-green-600 font-medium">{appointment.client}</p>
      </div>

      {/* Description */}
      {appointment.description && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-gray-600">{appointment.description}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline"
          onClick={onEdit}
          className="flex-1 flex items-center gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button 
          onClick={onDelete}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
