
import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Package, ShoppingCart, MessageSquare, Settings, Gift, Tag, Layout, Percent, Zap } from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/admin/users', label: 'Utilisateurs', icon: Users },
    { path: '/admin/products', label: 'Produits', icon: Package },
    { path: '/admin/categories', label: 'Catégories', icon: Tag },
    { path: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/client-chat', label: 'Chat Client', icon: MessageSquare },
    { path: '/admin/code-promos', label: 'Codes Promo', icon: Gift },
    { path: '/admin/flash-sales', label: 'Flash Sales', icon: Zap },
    { path: '/admin/remboursements', label: 'Remboursements', icon: Percent },
    { path: '/admin/pub-layout', label: 'Mise en page', icon: Layout },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Admin Panel
              </Link>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
