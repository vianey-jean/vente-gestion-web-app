
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

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

interface SearchAppointmentFormProps {
  onSelect: (appointment: Appointment) => void;
}

const SearchAppointmentForm: React.FC<SearchAppointmentFormProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // TODO: Implémenter la recherche avec le service
      console.log('Recherche pour:', searchQuery);
      
      // Simulation de résultats
      const mockResults: Appointment[] = [
        {
          id: '1',
          titre: 'Rendez-vous test',
          date: '2024-12-15',
          heure: '10:00',
          duree: 30,
          description: 'Rendez-vous de test',
          client: 'Client Test',
          status: 'confirmed'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="search">Rechercher un rendez-vous</Label>
          <Input
            id="search"
            placeholder="Nom du client, titre du rendez-vous..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Résultats de recherche:</h3>
          {searchResults.map((appointment) => (
            <div
              key={appointment.id}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSelect(appointment)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{appointment.titre}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.client} - {appointment.date} à {appointment.heure}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <p className="text-gray-500 text-center py-4">
          Aucun rendez-vous trouvé pour "{searchQuery}"
        </p>
      )}
    </div>
  );
};

export default SearchAppointmentForm;
