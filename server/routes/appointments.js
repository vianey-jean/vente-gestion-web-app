
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Chemin vers le fichier JSON des rendez-vous
const appointmentsPath = path.join(__dirname, '../db/appointments.json');

// Utilitaire pour lire les rendez-vous
const readAppointments = () => {
  try {
    if (!fs.existsSync(appointmentsPath)) {
      return [];
    }
    const data = fs.readFileSync(appointmentsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des rendez-vous:', error);
    return [];
  }
};

// Utilitaire pour écrire les rendez-vous
const writeAppointments = (appointments) => {
  try {
    fs.writeFileSync(appointmentsPath, JSON.stringify(appointments, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture des rendez-vous:', error);
    return false;
  }
};

// GET /api/appointments - Récupérer tous les rendez-vous
router.get('/', (req, res) => {
  try {
    const appointments = readAppointments();
    res.json(appointments);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des rendez-vous' });
  }
});

// GET /api/appointments/week - Récupérer les rendez-vous d'une semaine
router.get('/week', (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'Les paramètres start et end sont requis' });
    }

    const appointments = readAppointments();
    const startDate = new Date(start);
    const endDate = new Date(end);

    const weekAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });

    res.json(weekAppointments);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des rendez-vous' });
  }
});

// GET /api/appointments/search - Rechercher des rendez-vous
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 3) {
      return res.status(400).json({ error: 'La requête de recherche doit contenir au moins 3 caractères' });
    }

    const appointments = readAppointments();
    const query = q.toLowerCase();

    const results = appointments.filter(appointment =>
      appointment.titre.toLowerCase().includes(query) ||
      appointment.client.toLowerCase().includes(query) ||
      appointment.description.toLowerCase().includes(query)
    );

    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la recherche de rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

// POST /api/appointments - Créer un nouveau rendez-vous
router.post('/', (req, res) => {
  try {
    const { titre, date, heure, duree, description, client } = req.body;

    // Validation des données requises
    if (!titre || !date || !heure || !duree || !client) {
      return res.status(400).json({ 
        error: 'Tous les champs requis doivent être remplis (titre, date, heure, duree, client)' 
      });
    }

    const appointments = readAppointments();
    
    const newAppointment = {
      id: uuidv4(),
      titre,
      date,
      heure,
      duree: parseInt(duree),
      description: description || '',
      client,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments.push(newAppointment);

    if (writeAppointments(appointments)) {
      res.status(201).json(newAppointment);
    } else {
      res.status(500).json({ error: 'Erreur lors de la sauvegarde du rendez-vous' });
    }
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du rendez-vous' });
  }
});

// PUT /api/appointments/:id - Mettre à jour un rendez-vous
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const appointments = readAppointments();
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);

    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Mettre à jour le rendez-vous
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (writeAppointments(appointments)) {
      res.json(appointments[appointmentIndex]);
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du rendez-vous' });
  }
});

// DELETE /api/appointments/:id - Supprimer un rendez-vous
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const appointments = readAppointments();
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);

    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    appointments.splice(appointmentIndex, 1);

    if (writeAppointments(appointments)) {
      res.json({ message: 'Rendez-vous supprimé avec succès' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du rendez-vous' });
  }
});

module.exports = router;
