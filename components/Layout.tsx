import React from 'react';
import Sidebar from './Sidebar';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onLogout, user }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;