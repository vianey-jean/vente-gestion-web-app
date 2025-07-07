
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface Appointment {
  id?: string;
  titre: string;
  date: string;
  heure: string;
  duree: number;
  description: string;
  client: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSave: (data: Omit<Appointment, 'id'>) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  appointment, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    titre: appointment?.titre || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    heure: appointment?.heure || '09:00',
    duree: appointment?.duree || 60,
    description: appointment?.description || '',
    client: appointment?.client || '',
    status: appointment?.status || 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Titre */}
      <div>
        <Label htmlFor="titre" className="text-sm font-medium text-gray-700">Titre</Label>
        <Input
          id="titre"
          placeholder="Rendez-vous avec ...."
          value={formData.titre}
          onChange={(e) => handleInputChange('titre', e.target.value)}
          required
          className="mt-1 border-2 border-pink-300 focus:border-pink-500 rounded-lg"
        />
      </div>

      {/* Date et Heure */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="heure" className="text-sm font-medium text-gray-700">Heure</Label>
          <div className="relative">
            <Input
              id="heure"
              type="time"
              value={formData.heure}
              onChange={(e) => handleInputChange('heure', e.target.value)}
              required
              className="mt-1"
            />
            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Durée */}
      <div>
        <Label htmlFor="duree" className="text-sm font-medium text-gray-700">Durée (minutes)</Label>
        <Input
          id="duree"
          type="number"
          min="15"
          step="15"
          value={formData.duree}
          onChange={(e) => handleInputChange('duree', parseInt(e.target.value))}
          required
          className="mt-1"
        />
      </div>

      {/* Lieu */}
      <div>
        <Label htmlFor="client" className="text-sm font-medium text-gray-700">Lieu</Label>
        <Input
          id="client"
          placeholder="Adresse"
          value={formData.client}
          onChange={(e) => handleInputChange('client', e.target.value)}
          required
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
        <Textarea
          id="description"
          placeholder="Détails du rendez-vous..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="mt-1 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
          ← Annuler
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          ✓ {appointment ? 'Modifier le rendez-vous' : 'Ajouter le rendez-vous'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
