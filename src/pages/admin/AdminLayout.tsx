
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag,
  Package,
  MessageCircle,
  Users,
  Truck,
  Settings,
  LogOut,
  Percent,
  MessageSquare,
  Megaphone,
  RefreshCw,
  Zap,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSecureRoute } from '@/services/secureIds';
=======
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, FolderOpen, Users, MessageCircle, Truck, Percent, Megaphone, RefreshCw, Zap, ShoppingBag, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { initSecureRoutes } from '@/services/secureIds';
import logo from "@/assets/logo.png";
>>>>>>> 0160e4c64de5882e1111c8bec114983ae189a27b

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
<<<<<<< HEAD
  const { user } = useAuth();
  const [isServiceAdmin, setIsServiceAdmin] = useState(false);
  
  useEffect(() => {
    // Check if the current user is a service client admin
    if (user && user.email === "service.client@example.com") {
      setIsServiceAdmin(true);
    }
  }, [user]);
  
  // Obtenir les routes sécurisées
  const secureRoutes = {
    produits: getSecureRoute('/admin/produits'),
    utilisateurs: getSecureRoute('/admin/utilisateurs'),
    messages: getSecureRoute('/admin/messages'),
    commandes: getSecureRoute('/admin/commandes'),
    chat: getSecureRoute('/admin'),
    serviceClient: getSecureRoute('/admin/service-client'),
    codePromo: getSecureRoute('/admin/code-promos'),
    parametres: getSecureRoute('/admin/parametres'),
    pubLayout: getSecureRoute('/admin/pub-layout'),
    remboursements: getSecureRoute('/admin/remboursements'),
    flashSales: getSecureRoute('/admin/flash-sales'),
    categories: getSecureRoute('/admin/categories'),
  };
  
=======
  const { user, logout } = useAuth();
  
  // Initialize secure routes
  const secureRoutesMap = initSecureRoutes();
  
  const secureRoutes = {
    produits: secureRoutesMap.get('/admin/produits') || '/admin/produits',
    categories: secureRoutesMap.get('/admin/categories') || '/admin/categories',
    utilisateurs: secureRoutesMap.get('/admin/utilisateurs') || '/admin/utilisateurs',
    messages: secureRoutesMap.get('/admin/messages') || '/admin/messages',
    commandes: secureRoutesMap.get('/admin/commandes') || '/admin/commandes',
    codePromo: secureRoutesMap.get('/admin/code-promos') || '/admin/code-promos',
    pubLayout: secureRoutesMap.get('/admin/pub-layout') || '/admin/pub-layout',
    remboursements: secureRoutesMap.get('/admin/remboursements') || '/admin/remboursements',
    flashSales: secureRoutesMap.get('/admin/flash-sales') || '/admin/flash-sales',
    chat: secureRoutesMap.get('/admin') || '/admin',
    serviceClient: secureRoutesMap.get('/admin/service-client') || '/admin/service-client',
    parametres: secureRoutesMap.get('/admin/parametres') || '/admin/parametres',
  };

  // Check if user is service admin
  const isServiceAdmin = user?.role === 'admin' && user?.permissions?.includes('service_client');

>>>>>>> 0160e4c64de5882e1111c8bec114983ae189a27b
  const navItems = [
    { name: 'Produits', path: secureRoutes.produits, realPath: '/admin/produits', icon: Package },
    { name: 'Catégories', path: secureRoutes.categories, realPath: '/admin/categories', icon: FolderOpen },
    { name: 'Utilisateurs', path: secureRoutes.utilisateurs, realPath: '/admin/utilisateurs', icon: Users },
    { name: 'Messages', path: secureRoutes.messages, realPath: '/admin/messages', icon: MessageCircle },
    { name: 'Commandes', path: secureRoutes.commandes, realPath: '/admin/commandes', icon: Truck },
    { name: 'CodePromo', path: secureRoutes.codePromo, realPath: '/admin/code-promos', icon: Percent },
    { name: 'Publicités', path: secureRoutes.pubLayout, realPath: '/admin/pub-layout', icon: Megaphone },
    { name: 'Remboursements', path: secureRoutes.remboursements, realPath: '/admin/remboursements', icon: RefreshCw },
    { name: 'Ventes Flash', path: secureRoutes.flashSales, realPath: '/admin/flash-sales', icon: Zap },
    { name: 'Chat Admin', path: secureRoutes.chat, realPath: '/admin', icon: ShoppingBag },
    // Conditional item for service client admin
    ...(isServiceAdmin ? [{ 
      name: 'Service Client', 
      path: secureRoutes.serviceClient, 
      realPath: '/admin/service-client',
      icon: MessageSquare 
    }] : []),
    { name: 'Paramètres', path: secureRoutes.parametres, realPath: '/admin/parametres', icon: Settings },
  ];

<<<<<<< HEAD
  // Verifier si le chemin actuel correspond à un chemin réel (pour la mise en surbrillance du menu)
  const isActivePath = (realPath: string) => {
    return location.pathname === realPath || location.pathname.startsWith(realPath + '/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white md:min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gray-900 text-white flex justify-between items-center">
          <span className="font-bold text-lg">Admin Dashboard</span>
          <button className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Riziky-Boutic</h1>
            <p className="text-gray-400 text-sm">Administration</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActivePath(item.realPath)
                    ? 'bg-red-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-8 border-t border-gray-700 mt-8">
            <Link to="/" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
              <LogOut className="h-5 w-5 mr-3" />
              Quitter
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          {children}
        </div>
=======
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-neutral-900 shadow-lg border-r border-neutral-200 dark:border-neutral-800">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Riziky Boutique" className="h-12 w-auto" />
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.nom}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.realPath;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8" role="main">
          {children}
        </main>
>>>>>>> 0160e4c64de5882e1111c8bec114983ae189a27b
      </div>
    </div>
  );
};

export default AdminLayout;
