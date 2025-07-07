
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Appointment {
  id?: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  location: string;
  type: string;
  status?: 'planned' | 'completed' | 'cancelled';
}

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: (appointmentData: any) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titre: appointment?.titre || '',
    description: appointment?.description || '',
    date: appointment?.date || '',
    heure: appointment?.heure || '',
    location: appointment?.location || '',
    type: appointment?.type || 'general',
    status: appointment?.status || 'planned'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titre">Titre *</Label>
        <Input
          id="titre"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          required
          placeholder="Titre du rendez-vous"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heure">Heure *</Label>
        <Input
          id="heure"
          name="heure"
          type="time"
          value={formData.heure}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Lieu du rendez-vous"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description du rendez-vous"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {appointment ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
