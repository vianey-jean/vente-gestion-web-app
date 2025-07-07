
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import WeekCalendar from '@/components/WeekCalendar';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentDetails from '@/components/AppointmentDetails';
import SearchAppointmentForm from '@/components/SearchAppointmentForm';
import ActionButtons from '@/components/ActionButtons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AppointmentsPage = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const [isSearchingAppointment, setIsSearchingAppointment] = useState(false);

  const handleAppointmentSelect = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentSave = () => {
    setIsAddingAppointment(false);
    setIsEditingAppointment(false);
    // Rafraîchir les données
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Gestion des Rendez-vous
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Planifiez et gérez vos rendez-vous efficacement
          </p>
        </div>

        <ActionButtons
          onAdd={() => setIsAddingAppointment(true)}
          onEdit={() => setIsEditingAppointment(true)}
          onDelete={() => setIsDeletingAppointment(true)}
          onSearch={() => setIsSearchingAppointment(true)}
        />

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Calendrier Hebdomadaire
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de vos rendez-vous de la semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeekCalendar onAppointmentSelect={handleAppointmentSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            {selectedAppointment && (
              <AppointmentDetails 
                appointment={selectedAppointment} 
                onClose={() => setSelectedAppointment(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Gestion des Clients</CardTitle>
                <CardDescription>
                  Liste de tous vos clients et leurs rendez-vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Fonctionnalité en développement...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
