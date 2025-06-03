
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, FolderOpen, Users, MessageCircle, Truck, Percent, Megaphone, RefreshCw, Zap, ShoppingBag, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { initSecureRoutes } from '@/services/secureIds';
import logo from "@/assets/logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
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
      </div>
    </div>
  );
};

export default AdminLayout;
