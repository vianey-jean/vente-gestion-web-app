/**
 * =============================================================================
 * Service de Cryptage/Décryptage Frontend - AES-256-GCM
 * =============================================================================
 * 
 * Utilise Web Crypto API (natif navigateur, très performant)
 * Même algorithme et clé que le backend pour interopérabilité
 * 
 * Toutes les données reçues du backend sont cryptées et décryptées ici.
 * Toutes les données envoyées au backend sont cryptées ici.
 * 
 * @module services/crypto
 */

const ENCRYPTION_KEY_RAW = 'gestion-vente-ultra-secure-key-2024-aes256';
const SALT = 'gestion-vente-salt-v2';
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 16;

// Cache de la clé dérivée pour performance
let cachedKey: CryptoKey | null = null;

/**
 * Dérive la clé AES-256 à partir de la clé brute via PBKDF2
 * Compatible avec le backend Node.js (mêmes paramètres)
 */
const getDerivedKey = async (): Promise<CryptoKey> => {
  if (cachedKey) return cachedKey;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY_RAW),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-512',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedKey;
};

/**
 * Convertit un ArrayBuffer en Base64
 */
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convertit du Base64 en ArrayBuffer
 */
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Crypte une chaîne de caractères (format compatible backend)
 * @returns Format: iv:authTag:cipherText (tout en base64)
 */
export const encrypt = async (text: string): Promise<string> => {
  const key = await getDerivedKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: 128 },
    key,
    encoder.encode(text)
  );

  // Web Crypto API concatène le ciphertext et l'authTag
  const encryptedArray = new Uint8Array(encrypted);
  const cipherText = encryptedArray.slice(0, encryptedArray.length - 16);
  const authTag = encryptedArray.slice(encryptedArray.length - 16);

  return `${bufferToBase64(iv.buffer)}:${bufferToBase64(authTag.buffer)}:${bufferToBase64(cipherText.buffer)}`;
};

/**
 * Décrypte une chaîne cryptée (format compatible backend)
 * @param encryptedText Format: iv:authTag:cipherText
 */
export const decrypt = async (encryptedText: string): Promise<string> => {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 3) return encryptedText;

  try {
    const key = await getDerivedKey();
    const iv = new Uint8Array(base64ToBuffer(parts[0]));
    const authTag = new Uint8Array(base64ToBuffer(parts[1]));
    const cipherText = new Uint8Array(base64ToBuffer(parts[2]));

    // Web Crypto attend cipherText + authTag concaténés
    const combined = new Uint8Array(cipherText.length + authTag.length);
    combined.set(cipherText);
    combined.set(authTag, cipherText.length);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: 128 },
      key,
      combined
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedText;
  }
};

/**
 * Décrypte une réponse API cryptée par le backend
 * Format attendu: { encrypted: true, data: "iv:authTag:cipherText", timestamp: number }
 */
export const decryptApiResponse = async <T = unknown>(response: unknown): Promise<T> => {
  // Vérifier si la réponse est cryptée
  if (
    response &&
    typeof response === 'object' &&
    'encrypted' in response &&
    (response as { encrypted: boolean }).encrypted === true &&
    'data' in response
  ) {
    const encryptedData = (response as { data: string }).data;
    const decryptedJson = await decrypt(encryptedData);
    
    try {
      return JSON.parse(decryptedJson) as T;
    } catch {
      return decryptedJson as unknown as T;
    }
  }

  // Si pas crypté, retourner tel quel
  return response as T;
};

/**
 * Crypte des données pour envoi au backend
 * @returns { encrypted: true, data: "iv:authTag:cipherText" }
 */
export const encryptForTransport = async (data: unknown): Promise<{ encrypted: boolean; data: string }> => {
  const jsonStr = JSON.stringify(data);
  const encryptedData = await encrypt(jsonStr);
  return {
    encrypted: true,
    data: encryptedData,
  };
};
