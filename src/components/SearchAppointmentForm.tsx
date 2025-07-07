
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchAppointmentFormProps {
  onSelect: (appointment: Appointment) => void;
}

const SearchAppointmentForm: React.FC<SearchAppointmentFormProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await appointmentService.searchAppointments(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Entrez au moins 3 caractères..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="border-2 border-pink-300 focus:border-pink-500 rounded-lg pl-4 pr-12"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || searchQuery.length < 3}
          className="absolute right-1 top-1 h-8 w-8 p-0 bg-pink-500 hover:bg-pink-600"
          size="icon"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => onSelect(appointment)}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-pink-300 transition-all duration-200"
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
        ) : searchQuery.length >= 3 && !isSearching ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun rendez-vous trouvé pour "{searchQuery}"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchAppointmentForm;
