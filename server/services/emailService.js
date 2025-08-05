const nodemailer = require('nodemailer');

// Configuration du service email
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'votre-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
  }
});

// Stockage temporaire des codes de vérification
const verificationCodes = new Map();

// Générer un code de vérification de 6 chiffres
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Envoyer un code de vérification par email
const sendVerificationCode = async (email) => {
  const code = generateVerificationCode();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
  
  // Stocker le code avec sa date d'expiration
  verificationCodes.set(email, { code, expiresAt });
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'votre-email@gmail.com',
    to: email,
    subject: 'Code de vérification - Riziky Agendas',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Code de vérification</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Votre code de vérification est :</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p style="color: #666;">Ce code expire dans 24 heures.</p>
        <p style="color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

// Vérifier un code de vérification
const verifyCode = (email, code) => {
  const storedData = verificationCodes.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'Aucun code trouvé pour cet email' };
  }
  
  if (Date.now() > storedData.expiresAt) {
    verificationCodes.delete(email);
    return { valid: false, message: 'Le code a expiré' };
  }
  
  if (storedData.code !== code) {
    return { valid: false, message: 'Code incorrect' };
  }
  
  // Code valide, le supprimer après utilisation
  verificationCodes.delete(email);
  return { valid: true };
};

module.exports = {
  sendVerificationCode,
  verifyCode
};