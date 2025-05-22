
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';

export interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
