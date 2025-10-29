

/**
 * Types d'environnement pour TypeScript
 * Définit les types pour les variables d'environnement accessibles via import.meta.env
 * Mis à jour pour inclure les variables Supabase
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly PROD: boolean;
  readonly SSR: boolean;
  // Ajoutez d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  process: {
    env: {
      [key: string]: string | undefined;
    }
  }
}
