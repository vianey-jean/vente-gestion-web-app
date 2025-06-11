
import CryptoJS from 'crypto-js';

export class SecurityManager {
  private static instance: SecurityManager;
  private readonly ENCRYPTION_KEY = 'riziky-security-2024';
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private maxFailedAttempts = 5;
  private failedAttempts = new Map<string, number>();

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Validation de session automatique
  validateSession(): boolean {
    const token = this.getSecureItem('authToken');
    const sessionStart = this.getSecureItem('sessionStart');
    
    if (!token || !sessionStart) return false;
    
    const sessionAge = Date.now() - parseInt(sessionStart);
    if (sessionAge > this.sessionTimeout) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  // Démarrage de session sécurisé
  startSecureSession(token: string, user: any): void {
    this.setSecureItem('authToken', token);
    this.setSecureItem('user', JSON.stringify(user));
    this.setSecureItem('sessionStart', Date.now().toString());
    
    // Programmer la validation automatique
    this.scheduleSessionValidation();
  }

  // Nettoyage de session
  clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    console.log('🔒 Session nettoyée pour sécurité');
  }

  // Programmer la validation de session
  private scheduleSessionValidation(): void {
    setTimeout(() => {
      if (!this.validateSession()) {
        window.location.href = '/login';
      } else {
        this.scheduleSessionValidation(); // Reprogrammer
      }
    }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
  }

  // Cryptage sécurisé
  encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY);
      return encrypted.toString();
    } catch (error) {
      console.error('Erreur de cryptage:', error);
      return data;
    }
  }

  // Décryptage sécurisé
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || encryptedData;
    } catch (error) {
      console.error('Erreur de décryptage:', error);
      return encryptedData;
    }
  }

  // Stockage sécurisé
  setSecureItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Erreur de stockage sécurisé:', error);
    }
  }

  // Récupération sécurisée
  getSecureItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Erreur de récupération sécurisée:', error);
      return null;
    }
  }

  // Protection contre les attaques par force brute
  recordFailedAttempt(identifier: string): boolean {
    const attempts = this.failedAttempts.get(identifier) || 0;
    const newAttempts = attempts + 1;
    
    this.failedAttempts.set(identifier, newAttempts);
    
    if (newAttempts >= this.maxFailedAttempts) {
      console.warn(`🚨 Trop de tentatives échouées pour ${identifier}`);
      return false;
    }
    
    return true;
  }

  // Réinitialiser les tentatives échouées
  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  // Validation XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/eval\(/gi, '')
      .replace(/expression\(/gi, '')
      .trim();
  }

  // Validation des URLs
  validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      return allowedProtocols.includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  // Génération de nonce pour CSP
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validation de token JWT
  validateJWT(token: string): boolean {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Vérifier que les parties sont base64 valides
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      
      return true;
    } catch {
      return false;
    }
  }

  // Headers de sécurité CSP
  getSecurityHeaders(): Record<string, string> {
    const nonce = this.generateNonce();
    
    return {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' ${import.meta.env.VITE_API_BASE_URL};
        frame-ancestors 'none';
      `.replace(/\s+/g, ' ').trim(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Audit de sécurité
  performSecurityAudit(): void {
    console.group('🔍 Audit de sécurité');
    
    // Vérifier la session
    console.log('Session valide:', this.validateSession());
    
    // Vérifier le stockage local
    const sensitiveKeys = ['authToken', 'user', 'sessionStart'];
    sensitiveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value === this.getSecureItem(key)) {
        console.warn(`⚠️ Clé ${key} non cryptée!`);
      }
    });
    
    // Vérifier les headers de sécurité
    console.log('Headers de sécurité:', this.getSecurityHeaders());
    
    console.groupEnd();
  }
}

export default SecurityManager;
