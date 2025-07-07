import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import WeekCalendar from '@/components/Weekcalendar';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentDetails from '@/components/AppointmentDetails';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

interface Appointment {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  location: string;
  type: string;
  status: 'planned' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Charger les rendez-vous
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Gestion des actions
  const handleCreateAppointment = async (appointmentData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      setAppointments(prev => [...prev, response.data]);
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Rendez-vous créé avec succès",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!editingAppointment) return;

    try {
      const response = await api.put(`/appointments/${editingAppointment.id}`, appointmentData);
      setAppointments(prev => 
        prev.map(app => app.id === editingAppointment.id ? response.data : app)
      );
      setEditingAppointment(null);
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Rendez-vous modifié avec succès",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      setIsDetailsOpen(false);
      toast({
        title: "Succès",
        description: "Rendez-vous supprimé avec succès",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
          <p className="text-muted-foreground">
            Organisez et gérez vos rendez-vous facilement
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment 
                  ? 'Modifiez les informations de votre rendez-vous'
                  : 'Créez un nouveau rendez-vous en remplissant le formulaire'
                }
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              appointment={editingAppointment}
              onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAppointment(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un rendez-vous..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === 'planned' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('planned')}
                size="sm"
              >
                Planifiés
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                size="sm"
              >
                Terminés
              </Button>
              <Button
                variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('cancelled')}
                size="sm"
              >
                Annulés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <WeekCalendar
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun rendez-vous trouvé</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Commencez par créer votre premier rendez-vous'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{appointment.titre}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(appointment.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {appointment.heure}
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {appointment.location}
                      </div>
                    )}
                    {appointment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {appointment.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(appointment);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog des détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onEdit={() => {
                setIsDetailsOpen(false);
                handleEditClick(selectedAppointment);
              }}
              onDelete={() => handleDeleteAppointment(selectedAppointment.id)}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
