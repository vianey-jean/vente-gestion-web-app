
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'zh' | 'ar';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Dictionnaire des traductions
const translations: Record<Language, Record<string, string>> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.cart': 'Panier',
    'nav.profile': 'Profil',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'language.french': 'Français',
    'language.english': 'Anglais',
    'language.spanish': 'Espagnol',
    'language.chinese': '中文',
    'language.arabic': 'العربية'
  },
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'language.french': 'French',
    'language.english': 'English',
    'language.spanish': 'Spanish',
    'language.chinese': 'Chinese',
    'language.arabic': 'Arabic'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.cart': 'Carrito',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'language.french': 'Francés',
    'language.english': 'Inglés',
    'language.spanish': 'Español',
    'language.chinese': 'Chino',
    'language.arabic': 'Árabe'
  },
  zh: {
    'nav.home': '首页',
    'nav.products': '产品',
    'nav.cart': '购物车',
    'nav.profile': '个人资料',
    'nav.login': '登录',
    'nav.register': '注册',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'language.french': '法语',
    'language.english': '英语',
    'language.spanish': '西班牙语',
    'language.chinese': '中文',
    'language.arabic': '阿拉伯语'
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.cart': 'السلة',
    'nav.profile': 'الملف الشخصي',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    'language.french': 'الفرنسية',
    'language.english': 'الإنجليزية',
    'language.spanish': 'الإسبانية',
    'language.chinese': 'الصينية',
    'language.arabic': 'العربية'
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('preferred-language') as Language;
    return savedLang || 'fr';
  });

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
