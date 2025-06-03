
import React from 'react';
import Navbar from '@/components/layout/Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
