import { Home, MessageSquare, Settings as SettingsIcon, Gamepad2, Newspaper } from 'lucide-react';
import { Screen, Settings } from '../App';

interface NavbarProps {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  settings: Settings;
}

export function Navbar({ currentScreen, navigateTo, settings }: NavbarProps) {
  const isDark = settings.darkMode;

  const tabs = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'articles' as Screen, label: 'Articles', icon: Newspaper },
    { id: 'ai-prompt' as Screen, label: 'AI Assistant', icon: MessageSquare },
    { id: 'games' as Screen, label: 'Games', icon: Gamepad2 },
    { id: 'settings' as Screen, label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <nav id="navbar" className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b sticky top-0 z-50 shadow-lg animate-slideUp`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentScreen === tab.id || 
              (currentScreen === 'categories' && tab.id === 'home') ||
              (currentScreen === 'article' && tab.id === 'articles') ||
              (currentScreen === 'simple' && tab.id === 'articles');

            return (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`flex flex-col items-center gap-2 py-4 px-6 transition-all transform hover:scale-110 ${
                  isActive
                    ? isDark 
                      ? 'text-blue-400 border-b-4 border-blue-400' 
                      : 'text-blue-600 border-b-4 border-blue-600'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                } ${settings.highContrast && isActive ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <Icon className="w-7 h-7" strokeWidth={2.5} />
                <span style={{ fontSize: '1.2em' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}