
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Appointment } from './AppointmentService';
import { format, parseISO, isAfter, addMinutes } from 'date-fns';

// Function to check if a notification should be sent for an appointment
const shouldNotify = (appointment: Appointment): boolean => {
  const appointmentDateTime = parseISO(`${appointment.date}T${appointment.heure}`);
  const now = new Date();
  const notificationTime = addMinutes(now, 30);
  
  return isAfter(appointmentDateTime, now) && 
         !isAfter(appointmentDateTime, notificationTime);
};

// Custom hook for notification service
export const useNotificationService = (appointments: Appointment[]) => {
  const [notifiedAppointments, setNotifiedAppointments] = useState<Set<string>>(new Set());

  // Check for appointments that need notifications
  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    // Filter for appointments that should be notified and haven't been yet
    const appointmentsToNotify = appointments.filter(
      (appointment) => 
        shouldNotify(appointment) && 
        !notifiedAppointments.has(appointment.id.toString())
    );

    // Send notifications for filtered appointments
    if (appointmentsToNotify.length > 0) {
      appointmentsToNotify.forEach((appointment) => {
        const formattedTime = appointment.heure;
        const formattedDate = format(parseISO(appointment.date), 'dd/MM/yyyy');
        
        toast.warning(
          `Rappel: "${appointment.titre}" à ${formattedTime} le ${formattedDate}`,
          {
            duration: 8000,
            description: `Lieu: ${appointment.location || 'Non spécifié'}`,
          }
        );
        
        // Add to notified set
        setNotifiedAppointments((prev) => {
          const newSet = new Set(prev);
          newSet.add(appointment.id.toString());
          return newSet;
        });
      });
    }
  }, [appointments, notifiedAppointments]);

  // Reset notifications function
  const resetNotifications = () => {
    setNotifiedAppointments(new Set());
  };

  return {
    resetNotifications
  };
};

// Export a singleton instance of the notification service for direct usage
export const notificationService = {
  notify: (title: string, message: string) => {
    toast(title, {
      description: message,
    });
  },
  warning: (title: string, message: string) => {
    toast.warning(title, {
      description: message,
    });
  },
  success: (title: string, message: string) => {
    toast.success(title, {
      description: message,
    });
  },
  error: (title: string, message: string) => {
    toast.error(title, {
      description: message,
    });
  }
};
