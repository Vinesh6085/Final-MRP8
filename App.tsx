
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Roadmaps from './pages/Roadmaps';
import Tutor from './pages/Tutor';
import QuizGenerator from './pages/QuizGenerator';
import Recommendations from './pages/Recommendations';
import Research from './pages/Research';
import Settings from './pages/Settings';
import { authService } from './services/authService';
import { User } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [navParams, setNavParams] = useState<any>(null); // State to hold navigation parameters
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const handleLoginSuccess = (user: User) => {
     setUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setActivePage('dashboard');
    setNavParams(null);
  };

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    setNavParams(params || null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center animate-bounce">
             <Loader2 className="text-white animate-spin" size={32} />
          </div>
          <p className="text-gray-500 font-medium">Loading EduGenius...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate} onLogout={handleLogout} user={user}>
      {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} user={user} />}
      {activePage === 'courses' && <Courses user={user} initialParams={navParams} />}
      {activePage === 'research' && <Research />}
      {activePage === 'roadmaps' && <Roadmaps />}
      {activePage === 'tutor' && <Tutor user={user} />}
      {activePage === 'quiz' && <QuizGenerator />}
      {activePage === 'recommendations' && <Recommendations />}
      {activePage === 'settings' && <Settings user={user} onUpdateUser={handleLoginSuccess} />}
    </Layout>
  );
}
