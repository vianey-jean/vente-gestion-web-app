
const fs = require('fs');
const path = require('path');

const appointmentsPath = path.join(__dirname, '../db/appointments.json');

const Appointment = {
  // Get all appointments
  getAll: () => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      return appointments;
    } catch (error) {
      console.error("Error reading appointments:", error);
      return [];
    }
  },

  // Get appointment by ID
  getById: (id) => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      return appointments.find(appointment => appointment.id === id) || null;
    } catch (error) {
      console.error("Error finding appointment by id:", error);
      return null;
    }
  },

  // Get appointments by user ID
  getByUserId: (userId) => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      return appointments.filter(appointment => appointment.userId === userId);
    } catch (error) {
      console.error("Error finding appointments by user id:", error);
      return [];
    }
  },

  // Get appointments by date range
  getByDateRange: (startDate, endDate) => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      return appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
      });
    } catch (error) {
      console.error("Error finding appointments by date range:", error);
      return [];
    }
  },

  // Create new appointment
  create: (appointmentData) => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      
      const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      appointments.push(newAppointment);
      fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
      
      return newAppointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      return null;
    }
  },

  // Update appointment
  update: (id, appointmentData) => {
    try {
      let appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      
      const appointmentIndex = appointments.findIndex(appointment => appointment.id === id);
      if (appointmentIndex === -1) {
        return null;
      }
      
      appointments[appointmentIndex] = { 
        ...appointments[appointmentIndex], 
        ...appointmentData,
        updatedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error("Error updating appointment:", error);
      return null;
    }
  },

  // Delete appointment
  delete: (id) => {
    try {
      let appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      
      const appointmentIndex = appointments.findIndex(appointment => appointment.id === id);
      if (appointmentIndex === -1) {
        return false;
      }
      
      appointments.splice(appointmentIndex, 1);
      fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
      
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }
  },

  // Search appointments
  search: (query) => {
    try {
      const appointments = JSON.parse(fs.readFileSync(appointmentsPath, 'utf8'));
      const searchQuery = query.toLowerCase();
      
      return appointments.filter(appointment =>
        appointment.titre?.toLowerCase().includes(searchQuery) ||
        appointment.description?.toLowerCase().includes(searchQuery) ||
        appointment.location?.toLowerCase().includes(searchQuery)
      );
    } catch (error) {
      console.error("Error searching appointments:", error);
      return [];
    }
  }
};

module.exports = Appointment;
