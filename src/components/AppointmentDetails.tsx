
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  location: string;
  type: string;
  status: 'planned' | 'completed' | 'cancelled';
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
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{appointment.titre}</h3>
        <Badge variant={getStatusBadgeVariant(appointment.status)}>
          {getStatusLabel(appointment.status)}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.heure}</span>
        </div>

        {appointment.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.location}</span>
          </div>
        )}
      </div>

      {appointment.description && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{appointment.description}</p>
          </div>
        </>
      )}

      <Separator />
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button variant="destructive" onClick={onDelete} className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
