import React from 'react';
import { LayoutDashboard, BookOpen, Map, MessageSquare, BrainCircuit, Lightbulb, Settings, UserCircle, LogOut, Library } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: { name: string; email: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'research', label: 'Research Assistant', icon: Library },
    { id: 'roadmaps', label: 'Career Roadmaps', icon: Map },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz Generator', icon: BrainCircuit },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 hidden md:flex z-10">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-none">EduGenius</h1>
            <p className="text-[10px] text-blue-600 font-bold tracking-widest">AI PLATFORM</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
