
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Search } from 'lucide-react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import WeekCalendar from '@/components/WeekCalendar';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentDetails from '@/components/AppointmentDetails';
import SearchAppointmentForm from '@/components/SearchAppointmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AppointmentsPage = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [isSearchingAppointment, setIsSearchingAppointment] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const handleAppointmentSelect = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentSave = () => {
    setIsAddingAppointment(false);
    setIsEditingAppointment(false);
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 relative">
            <Calendar className="h-8 w-8 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Gérez vos rendez-vous avec style et efficacité</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            onClick={() => setIsAddingAppointment(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Ajouter un rendez-vous
          </Button>
          
          <Button 
            onClick={() => setIsEditingAppointment(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Edit className="h-5 w-5" />
            Modifier un rendez-vous
          </Button>
          
          <Button 
            onClick={() => setIsDeletingAppointment(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Trash2 className="h-5 w-5" />
            Supprimer un rendez-vous
          </Button>
          
          <Button 
            onClick={() => setIsSearchingAppointment(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Search className="h-5 w-5" />
            Rechercher un rendez-vous
          </Button>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Calendrier Intelligent</h2>
                  <p className="text-purple-100 text-sm">Interface premium</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-lg"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-lg"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Header Days */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const isCurrentDay = isToday(day);
                return (
                  <div key={index} className={`text-center p-3 rounded-xl transition-all duration-300 ${
                    isCurrentDay 
                      ? 'bg-yellow-400 text-purple-800 shadow-lg transform scale-105' 
                      : 'text-white hover:bg-white/20'
                  }`}>
                    <div className="font-semibold text-sm uppercase">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      isCurrentDay ? 'text-purple-800' : 'text-white'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Body */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4 min-h-[400px]">
              {weekDays.map((day, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center h-12 text-purple-600 mb-4">
                    <Calendar className="h-6 w-6 opacity-30" />
                  </div>
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Aucun rendez-vous</p>
                    <p className="text-xs text-purple-400">Journée libre</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau Rendez-vous
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              onSave={handleAppointmentSave}
              onCancel={() => setIsAddingAppointment(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingAppointment} onOpenChange={setIsEditingAppointment}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le Rendez-vous</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              appointment={selectedAppointment}
              onSave={handleAppointmentSave}
              onCancel={() => setIsEditingAppointment(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isSearchingAppointment} onOpenChange={setIsSearchingAppointment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechercher un Rendez-vous</DialogTitle>
            </DialogHeader>
            <SearchAppointmentForm onSelect={handleAppointmentSelect} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppointmentsPage;
