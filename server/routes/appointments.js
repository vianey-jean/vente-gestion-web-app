
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// GET /api/appointments - Récupérer tous les rendez-vous de l'utilisateur
router.get('/', (req, res) => {
  try {
    const appointments = Appointment.getByUserId(req.user.id);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// GET /api/appointments/:id - Récupérer un rendez-vous spécifique
router.get('/:id', (req, res) => {
  try {
    const appointment = Appointment.getById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    
    // Vérifier que l'utilisateur est propriétaire du rendez-vous
    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du rendez-vous' });
  }
});

// GET /api/appointments/range/:startDate/:endDate - Récupérer les rendez-vous dans une plage de dates
router.get('/range/:startDate/:endDate', (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const appointments = Appointment.getByDateRange(startDate, endDate);
    
    // Filtrer par utilisateur
    const userAppointments = appointments.filter(appointment => appointment.userId === req.user.id);
    
    res.json(userAppointments);
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// POST /api/appointments - Créer un nouveau rendez-vous
router.post('/', (req, res) => {
  try {
    const { titre, description, date, heure, location, type } = req.body;
    
    // Validation des données
    if (!titre || !date || !heure) {
      return res.status(400).json({ error: 'Titre, date et heure sont obligatoires' });
    }
    
    const appointmentData = {
      titre,
      description: description || '',
      date,
      heure,
      location: location || '',
      type: type || 'general',
      userId: req.user.id,
      status: 'planned'
    };
    
    const newAppointment = Appointment.create(appointmentData);
    
    if (!newAppointment) {
      return res.status(500).json({ error: 'Erreur lors de la création du rendez-vous' });
    }
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rendez-vous' });
  }
});

// PUT /api/appointments/:id - Mettre à jour un rendez-vous
router.put('/:id', (req, res) => {
  try {
    const appointmentId = req.params.id;
    const existingAppointment = Appointment.getById(appointmentId);
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    
    // Vérifier que l'utilisateur est propriétaire du rendez-vous
    if (existingAppointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const { titre, description, date, heure, location, type, status } = req.body;
    
    const updatedData = {
      titre: titre || existingAppointment.titre,
      description: description !== undefined ? description : existingAppointment.description,
      date: date || existingAppointment.date,
      heure: heure || existingAppointment.heure,
      location: location !== undefined ? location : existingAppointment.location,
      type: type || existingAppointment.type,
      status: status || existingAppointment.status
    };
    
    const updatedAppointment = Appointment.update(appointmentId, updatedData);
    
    if (!updatedAppointment) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous' });
    }
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous' });
  }
});

// DELETE /api/appointments/:id - Supprimer un rendez-vous
router.delete('/:id', (req, res) => {
  try {
    const appointmentId = req.params.id;
    const existingAppointment = Appointment.getById(appointmentId);
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    
    // Vérifier que l'utilisateur est propriétaire du rendez-vous
    if (existingAppointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const deleted = Appointment.delete(appointmentId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous' });
    }
    
    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous' });
  }
});

// GET /api/appointments/search/:query - Rechercher des rendez-vous
router.get('/search/:query', (req, res) => {
  try {
    const query = req.params.query;
    const appointments = Appointment.search(query);
    
    // Filtrer par utilisateur
    const userAppointments = appointments.filter(appointment => appointment.userId === req.user.id);
    
    res.json(userAppointments);
  } catch (error) {
    console.error('Error searching appointments:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

module.exports = router;
