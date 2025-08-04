/**
 * ============================================================================
 * SERVICE D'ENVOI D'EMAIL - CONFIGURATION SMTP
 * ============================================================================
 * 
 * Ce service gère l'envoi d'emails pour l'application, notamment :
 * - Codes de vérification pour la réinitialisation de mot de passe
 * - Notifications utilisateur
 * - Emails de confirmation
 * 
 * FONCTIONNALITÉS :
 * - Configuration SMTP avec Nodemailer
 * - Templates d'email personnalisés
 * - Gestion des erreurs d'envoi
 * - Support des emails HTML et texte
 * 
 * CONFIGURATION :
 * - Utilise les variables d'environnement pour la sécurité
 * - Support des principaux providers (Gmail, Outlook, etc.)
 * - Template responsive pour les emails
 * 
 * @author Riziky Agendas Team
 * @version 1.0.0
 * @lastModified 2024
 */

const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
// En production, remplacez par vos vrais paramètres SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER || 'votre-email@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'votre-mot-de-passe-app'
    }
  });
};

/**
 * Template HTML pour l'email de code de vérification
 * @param {string} code - Code de vérification de 6 chiffres
 * @param {string} userEmail - Email de l'utilisateur
 * @returns {string} Template HTML de l'email
 */
const getVerificationEmailTemplate = (code, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de vérification - Riziky Agendas</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                margin-top: 20px;
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 10px 10px 0 0;
                margin: -20px -20px 20px -20px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .subtitle {
                font-size: 16px;
                opacity: 0.9;
            }
            .code-container {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                text-align: center;
                padding: 30px;
                border-radius: 10px;
                margin: 30px 0;
            }
            .code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .code-label {
                font-size: 14px;
                margin-bottom: 15px;
                opacity: 0.9;
            }
            .content {
                padding: 20px 0;
                line-height: 1.8;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            .security-tip {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🗓️ Riziky Agendas</div>
                <div class="subtitle">Réinitialisation de mot de passe</div>
            </div>
            
            <div class="content">
                <h2>Bonjour,</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour le compte <strong>${userEmail}</strong>.</p>
                
                <div class="code-container">
                    <div class="code-label">Votre code de vérification :</div>
                    <div class="code">${code}</div>
                </div>
                
                <p>Utilisez ce code dans l'application pour procéder à la réinitialisation de votre mot de passe.</p>
                
                <div class="warning">
                    <strong>⚠️ Important :</strong> Ce code est valide pendant <strong>24 heures</strong> uniquement et ne peut être utilisé qu'une seule fois.
                </div>
                
                <div class="security-tip">
                    <strong>🔐 Conseil sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
                </div>
                
                <p>Si vous rencontrez des difficultés, n'hésitez pas à nous contacter à <a href="mailto:support@rizikyagendas.com">support@rizikyagendas.com</a>.</p>
            </div>
            
            <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                <p>© 2024 Riziky Agendas - Tous droits réservés</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Version texte simple de l'email (fallback)
 * @param {string} code - Code de vérification
 * @param {string} userEmail - Email de l'utilisateur
 * @returns {string} Version texte de l'email
 */
const getVerificationEmailText = (code, userEmail) => {
  return `
Riziky Agendas - Réinitialisation de mot de passe

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour le compte ${userEmail}.

Votre code de vérification : ${code}

Ce code est valide pendant 24 heures uniquement.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe Riziky Agendas
  `;
};

/**
 * Envoie un email avec le code de vérification
 * @param {string} email - Adresse email du destinataire
 * @param {string} code - Code de vérification de 6 chiffres
 * @returns {Promise<boolean>} True si envoi réussi, false sinon
 */
const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    // Configuration de l'email
    const mailOptions = {
      from: {
        name: 'Riziky Agendas',
        address: process.env.SMTP_FROM || 'noreply@rizikyagendas.com'
      },
      to: email,
      subject: `🔐 Code de vérification : ${code}`,
      text: getVerificationEmailText(code, email),
      html: getVerificationEmailTemplate(code, email)
    };
    
    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé avec succès:', info.messageId);
    console.log('Code envoyé à:', email, '- Code:', code);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

/**
 * Teste la configuration SMTP
 * @returns {Promise<boolean>} True si configuration valide
 */
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Configuration SMTP valide ✅');
    return true;
  } catch (error) {
    console.error('Erreur de configuration SMTP ❌:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  testEmailConfiguration
};