
const express = require('express');
const router = express.Router();
const database = require('../core/database');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Assurer que le fichier de paramètres existe
database.ensureFile('settings.json', {
  id: 'default',
  general: {
    siteName: 'Riziky-Boutic',
    siteDescription: 'Votre boutique en ligne de confiance',
    siteUrl: 'https://riziky-boutic.com',
    maintenanceMode: false,
    maintenanceMessage: 'Site en maintenance. Nous reviendrons bientôt !',
    allowRegistration: true,
    requireEmailVerification: false,
    maxProductsPerPage: 20,
    defaultCurrency: 'EUR',
    taxRate: 20,
    shippingCost: 5.99,
    freeShippingThreshold: 50,
    contactEmail: 'contact@riziky-boutic.com',
    supportPhone: '+33 1 23 45 67 89',
    socialMediaLinks: {},
    seoSettings: {
      metaTitle: 'Riziky-Boutic - Votre boutique en ligne',
      metaDescription: 'Découvrez notre sélection de produits de qualité',
      metaKeywords: 'boutique, en ligne, qualité'
    },
    analyticsSettings: {},
    paymentSettings: {
      enableStripe: true,
      enablePayPal: true,
      enableCreditCard: true
    },
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@riziky-boutic.com',
      fromName: 'Riziky-Boutic'
    }
  },
  notifications: {
    emailNotifications: {
      newOrder: true,
      orderStatusChange: true,
      newUser: true,
      contactForm: true,
      lowStock: true,
      newReview: true,
      refundRequest: true,
      systemAlerts: true
    },
    smsNotifications: {
      newOrder: false,
      orderStatusChange: false,
      systemAlerts: true
    },
    pushNotifications: {
      newOrder: true,
      orderStatusChange: true,
      newUser: false,
      newReview: true,
      systemAlerts: true
    },
    slackNotifications: {
      newOrder: false,
      systemAlerts: false,
      errorReports: false
    },
    discordNotifications: {
      newOrder: false,
      systemAlerts: false,
      errorReports: false
    }
  },
  backup: {
    autoBackup: true,
    backupInterval: 'daily',
    backupTime: '23:58',
    emailBackup: true,
    backupEmail: 'vianey.jean@ymail.com',
    retentionDays: 30
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// GET /api/settings - Récupérer les paramètres
router.get('/', (req, res) => {
  try {
    const settings = database.read('settings.json');
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la lecture des paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

// PUT /api/settings - Mettre à jour les paramètres
router.put('/', (req, res) => {
  try {
    const currentSettings = database.read('settings.json');
    const updatedSettings = {
      ...currentSettings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    database.write('settings.json', updatedSettings);
    
    // Si le mode maintenance a été activé/désactivé, on peut ajouter une logique spéciale ici
    if (req.body.general?.maintenanceMode !== undefined) {
      console.log(`Mode maintenance ${req.body.general.maintenanceMode ? 'activé' : 'désactivé'}`);
    }
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

// PUT /api/settings/general - Mettre à jour les paramètres généraux
router.put('/general', (req, res) => {
  try {
    const settings = database.read('settings.json');
    settings.general = { ...settings.general, ...req.body };
    settings.updatedAt = new Date().toISOString();
    
    database.write('settings.json', settings);
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres généraux:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres généraux' });
  }
});

// PUT /api/settings/notifications - Mettre à jour les paramètres de notification
router.put('/notifications', (req, res) => {
  try {
    const settings = database.read('settings.json');
    settings.notifications = { ...settings.notifications, ...req.body };
    settings.updatedAt = new Date().toISOString();
    
    database.write('settings.json', settings);
    res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres de notification' });
  }
});

// POST /api/settings/backup/manual - Sauvegarde manuelle
router.post('/backup/manual', async (req, res) => {
  try {
    const backupData = await createBackup();
    res.json({ message: 'Sauvegarde créée avec succès', backup: backupData });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde manuelle:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde manuelle' });
  }
});

// Fonction pour créer une sauvegarde
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  // Créer le dossier de sauvegarde s'il n'existe pas
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupData = {
    timestamp,
    data: {
      users: database.read('users.json'),
      products: database.read('products.json'),
      orders: database.read('orders.json'),
      categories: database.read('categories.json'),
      contacts: database.read('contacts.json'),
      reviews: database.read('reviews.json'),
      settings: database.read('settings.json'),
      favorites: database.read('favorites.json'),
      panier: database.read('panier.json'),
      'code-promos': database.read('code-promos.json'),
      remboursements: database.read('remboursements.json'),
      'flash-sales': database.read('flash-sales.json'),
      publayout: database.read('publayout.json'),
      'client-chat': database.read('client-chat.json'),
      'admin-chat': database.read('admin-chat.json'),
      visitors: database.read('visitors.json'),
      'sales-notifications': database.read('sales-notifications.json')
    }
  };
  
  const backupFilename = `backup-${timestamp}.json`;
  const backupPath = path.join(backupDir, backupFilename);
  
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  
  // Envoyer par email si configuré
  const settings = database.read('settings.json');
  if (settings.backup?.emailBackup && settings.backup?.backupEmail) {
    await sendBackupEmail(backupPath, settings.backup.backupEmail, settings.general.emailSettings);
  }
  
  return { filename: backupFilename, path: backupPath, size: fs.statSync(backupPath).size };
}

// Fonction pour envoyer la sauvegarde par email
async function sendBackupEmail(backupPath, emailAddress, emailSettings) {
  try {
    if (!emailSettings.smtpHost || !emailSettings.smtpUser) {
      console.log('Configuration SMTP incomplète, envoi d\'email annulé');
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      secure: emailSettings.smtpPort === 465,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPassword
      }
    });

    const mailOptions = {
      from: `${emailSettings.fromName} <${emailSettings.fromEmail}>`,
      to: emailAddress,
      subject: `Sauvegarde automatique Riziky-Boutic - ${new Date().toLocaleDateString('fr-FR')}`,
      html: `
        <h2>Sauvegarde automatique Riziky-Boutic</h2>
        <p>Voici la sauvegarde automatique de votre site Riziky-Boutic.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Taille du fichier:</strong> ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB</p>
        <p>Cette sauvegarde contient toutes les données de votre site.</p>
      `,
      attachments: [{
        filename: path.basename(backupPath),
        path: backupPath
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('Sauvegarde envoyée par email avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la sauvegarde par email:', error);
  }
}

// Planifier les sauvegardes automatiques
function scheduleBackups() {
  const settings = database.read('settings.json');
  
  if (settings.backup?.autoBackup) {
    const backupTime = settings.backup.backupTime || '23:58';
    const [hour, minute] = backupTime.split(':');
    
    // Programmer la sauvegarde quotidienne à l'heure spécifiée
    cron.schedule(`${minute} ${hour} * * *`, async () => {
      console.log('Démarrage de la sauvegarde automatique...');
      try {
        await createBackup();
        console.log('Sauvegarde automatique terminée avec succès');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    });
    
    console.log(`Sauvegarde automatique programmée à ${backupTime} chaque jour`);
  }
}

// Démarrer les sauvegardes automatiques
scheduleBackups();

module.exports = router;
