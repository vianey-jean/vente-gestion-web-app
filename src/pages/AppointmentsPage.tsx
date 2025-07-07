
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Search } from 'lucide-react';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentDetails from '@/components/AppointmentDetails';
import SearchAppointmentForm from '@/components/SearchAppointmentForm';
import AppointmentSelectModal from '@/components/AppointmentSelectModal';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';

const AppointmentsPage = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [isSearchingAppointment, setIsSearchingAppointment] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadAppointments();
  }, [currentWeek]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');
      const data = await appointmentService.getAppointmentsByWeek(startDate, endDate);
      setAppointments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentSave = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment.id, appointmentData);
        toast({
          title: "Succès",
          description: "Rendez-vous modifié avec succès"
        });
      } else {
        await appointmentService.createAppointment(appointmentData);
        toast({
          title: "Succès",
          description: "Rendez-vous créé avec succès"
        });
      }
      await loadAppointments();
      setIsAddingAppointment(false);
      setIsEditingAppointment(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le rendez-vous",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentDelete = async (appointment: Appointment) => {
    try {
      await appointmentService.deleteAppointment(appointment.id);
      toast({
        title: "Succès",
        description: "Rendez-vous supprimé avec succès"
      });
      await loadAppointments();
      setIsDeletingAppointment(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewingDetails(true);
  };

  const getAppointmentsForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dayString);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Calendrier Intelligent</h1>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">En direct</span>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <Card className="overflow-hidden shadow-lg">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Calendrier Hebdomadaire</h2>
                  <p className="text-purple-100 text-sm">⭐ Interface premium</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-lg"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-lg"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, index) => {
                const isCurrentDay = isToday(day);
                return (
                  <div key={index} className={`p-4 text-center border-r last:border-r-0 ${
                    isCurrentDay ? 'bg-purple-100' : 'bg-gray-50'
                  }`}>
                    <div className="font-semibold text-sm text-gray-700 uppercase mb-1">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isCurrentDay ? 'text-purple-600' : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    {isCurrentDay && (
                      <div className="flex justify-center mt-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 min-h-[500px]">
              {weekDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div key={index} className={`border-r last:border-r-0 p-3 ${
                    isCurrentDay ? 'bg-purple-50/50' : ''
                  }`}>
                    {isLoading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ) : dayAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment)}
                            className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="font-semibold text-sm">tisage bouclé</span>
                            </div>
                            <div className="text-xs opacity-90">
                              ⏰ {appointment.heure}
                            </div>
                            <div className="text-xs opacity-90">
                              📍 {appointment.client}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Calendar className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-sm">Aucun rendez-vous</p>
                        <p className="text-xs text-gray-400">Journée libre</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Positioned as floating buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button 
            onClick={() => setIsAddingAppointment(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          <Button 
            onClick={() => setIsEditingAppointment(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <Edit className="h-6 w-6" />
          </Button>
          
          <Button 
            onClick={() => setIsDeletingAppointment(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <Trash2 className="h-6 w-6" />
          </Button>
          
          <Button 
            onClick={() => setIsSearchingAppointment(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
            size="icon"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>

        {/* Dialogs */}
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-600">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-purple-600" />
                </div>
                Ajouter un rendez-vous
              </DialogTitle>
              <p className="text-sm text-gray-600">Créez un nouveau rendez-vous</p>
            </DialogHeader>
            <AppointmentForm 
              onSave={handleAppointmentSave}
              onCancel={() => setIsAddingAppointment(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingAppointment} onOpenChange={setIsEditingAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-600">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 text-purple-600" />
                </div>
                Sélectionner un rendez-vous à modifier
              </DialogTitle>
              <p className="text-sm text-gray-600">Choisissez un rendez-vous</p>
            </DialogHeader>
            <AppointmentSelectModal 
              onSelect={(appointment) => {
                setSelectedAppointment(appointment);
                setIsEditingAppointment(false);
                setIsAddingAppointment(true);
              }}
              onCancel={() => setIsEditingAppointment(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeletingAppointment} onOpenChange={setIsDeletingAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                Sélectionner un rendez-vous à supprimer
              </DialogTitle>
              <p className="text-sm text-gray-600">Action irréversible</p>
            </DialogHeader>
            <AppointmentSelectModal 
              onSelect={handleAppointmentDelete}
              onCancel={() => setIsDeletingAppointment(false)}
              isDeleteMode={true}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isSearchingAppointment} onOpenChange={setIsSearchingAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-600">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-purple-600" />
                </div>
                Rechercher un rendez-vous
              </DialogTitle>
              <p className="text-sm text-gray-600">Trouvez vos rendez-vous</p>
            </DialogHeader>
            <SearchAppointmentForm 
              onSelect={(appointment) => {
                setSelectedAppointment(appointment);
                setIsSearchingAppointment(false);
                setIsViewingDetails(true);
              }} 
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent className="max-w-md">
            {selectedAppointment && (
              <AppointmentDetails 
                appointment={selectedAppointment}
                onEdit={() => {
                  setIsViewingDetails(false);
                  setIsAddingAppointment(true);
                }}
                onDelete={() => {
                  setIsViewingDetails(false);
                  handleAppointmentDelete(selectedAppointment);
                }}
                onClose={() => {
                  setIsViewingDetails(false);
                  setSelectedAppointment(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppointmentsPage;
