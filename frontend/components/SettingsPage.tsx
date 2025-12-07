import { Moon, Sun, Type, Volume2, Eye } from 'lucide-react';
import { Settings, Screen } from '../App';

interface SettingsPageProps {
  navigateTo: (screen: Screen) => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export function SettingsPage({ navigateTo, settings, updateSettings }: SettingsPageProps) {
  const isDark = settings.darkMode;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'} p-6 pt-20`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg text-center ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-fadeIn`}>
          <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '2.5em' }}>
            Settings
          </h1>
          <p className={`mt-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.25em' }}>
            Adjust the app to your needs
          </p>
        </div>

        {/* Text Size Slider */}
        <div id="text-size-slider" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-scaleIn`}>
          <div className="flex items-center gap-3 mb-6">
            <Type className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} strokeWidth={2.5} />
            <h2 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '1.5em' }}>Text Size</h2>
          </div>
          <div className="space-y-4">
            <input
              type="range"
              min="80"
              max="150"
              step="10"
              value={settings.textSize}
              onChange={(e) => updateSettings({ textSize: Number(e.target.value) })}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${isDark ? '#3b82f6' : '#3b82f6'} 0%, ${isDark ? '#3b82f6' : '#3b82f6'} ${((settings.textSize - 80) / 70) * 100}%, ${isDark ? '#475569' : '#e2e8f0'} ${((settings.textSize - 80) / 70) * 100}%, ${isDark ? '#475569' : '#e2e8f0'} 100%)`
              }}
            />
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '1.2em' }}>Small (80%)</span>
              <span className={isDark ? 'text-blue-400' : 'text-blue-500'} style={{ fontSize: '1.25em' }}>{settings.textSize}%</span>
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '1.2em' }}>Large (150%)</span>
            </div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-center mt-2`} style={{ fontSize: '1em' }}>
              Adjust the text size throughout the entire app
            </p>
          </div>
        </div>

        {/* Read Aloud Speed */}
        <div id="read-speed-slider" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-scaleIn`} style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-500'}`} strokeWidth={2.5} />
            <h2 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '1.5em' }}>Read-Aloud Speed</h2>
          </div>
          <div className="space-y-4">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.readAloudSpeed}
              onChange={(e) => updateSettings({ readAloudSpeed: Number(e.target.value) })}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${isDark ? '#10b981' : '#10b981'} 0%, ${isDark ? '#10b981' : '#10b981'} ${((settings.readAloudSpeed - 0.5) / 1.5) * 100}%, ${isDark ? '#475569' : '#e2e8f0'} ${((settings.readAloudSpeed - 0.5) / 1.5) * 100}%, ${isDark ? '#475569' : '#e2e8f0'} 100%)`
              }}
            />
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '1.2em' }}>Slow (0.5x)</span>
              <span className={isDark ? 'text-green-400' : 'text-green-500'} style={{ fontSize: '1.25em' }}>{settings.readAloudSpeed.toFixed(1)}x</span>
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '1.2em' }}>Fast (2x)</span>
            </div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-center mt-2`} style={{ fontSize: '1em' }}>
              Control how fast the voice reads articles to you
            </p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div id="dark-mode-toggle" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-scaleIn`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-slate-500'}`} strokeWidth={2.5} />
              ) : (
                <Sun className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} strokeWidth={2.5} />
              )}
              <div>
                <h2 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '1.5em' }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </h2>
                <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontSize: '1.2em' }}>
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className={`px-8 py-4 rounded-xl transition-all transform hover:scale-105 ${
                isDark
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-black'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
              }`}
              style={{ fontSize: '1.25em' }}
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div id="high-contrast-toggle" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-scaleIn`} style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} strokeWidth={2.5} />
              <div>
                <h2 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '1.5em' }}>
                  High Contrast
                </h2>
                <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontSize: '1.2em' }}>
                  Add yellow borders for better visibility
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ highContrast: !settings.highContrast })}
              className={`px-8 py-4 rounded-xl transition-all transform hover:scale-105 ${
                settings.highContrast
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black ring-4 ring-yellow-300'
                  : isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
              style={{ fontSize: '1.25em' }}
            >
              {settings.highContrast ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
