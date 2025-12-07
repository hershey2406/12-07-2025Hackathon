import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { CategoriesPage } from './components/CategoriesPage';
import { ArticlePage } from './components/ArticlePage';
import { SimpleExplanationPage } from './components/SimpleExplanationPage';
import { SettingsPage } from './components/SettingsPage';
import { AIPromptPage } from './components/AIPromptPage';
import { GamesPage } from './components/GamesPage';
import { ArticlesListPage } from './components/ArticlesListPage';
import { Navbar } from './components/Navbar';
import { ConversationProvider } from './context/ConversationContext';

export type Screen = 'home' | 'categories' | 'article' | 'simple' | 'settings' | 'ai-prompt' | 'games' | 'articles';

export interface Settings {
  textSize: number;
  readAloudSpeed: number;
  highContrast: boolean;
  language: string;
  simpleFirst: boolean;
  darkMode: boolean;
}

export interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  simpleContent: string;
  verySimpleContent: string;
  summary: string;
  meaningForYou: string;
  terms: { term: string; definition: string }[];
  date: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [settings, setSettings] = useState<Settings>({
    textSize: 100,
    readAloudSpeed: 1,
    highContrast: false,
    language: 'English',
    simpleFirst: false,
    darkMode: false
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const navigateTo = (screen: Screen, category?: string, article?: Article) => {
    setCurrentScreen(screen);
    if (category) setSelectedCategory(category);
    if (article) setSelectedArticle(article);
    // Scroll to top when navigating to a new screen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate font size multiplier
  const fontSizeMultiplier = settings.textSize / 100;

  return (
    <ConversationProvider>
      <div 
        className={`min-h-screen ${settings.darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
        style={{ 
          fontSize: `${16 * fontSizeMultiplier}px`,
          lineHeight: '1.5'
        }}
      >
        <Navbar currentScreen={currentScreen} navigateTo={navigateTo} settings={settings} />
        
        {currentScreen === 'home' && (
          <HomePage settings={settings} />
        )}
        {currentScreen === 'categories' && (
          <CategoriesPage navigateTo={navigateTo} settings={settings} />
        )}
        {currentScreen === 'article' && selectedArticle && (
          <ArticlePage 
            article={selectedArticle} 
            navigateTo={navigateTo} 
            settings={settings}
          />
        )}
        {currentScreen === 'simple' && selectedArticle && (
          <SimpleExplanationPage 
            article={selectedArticle} 
            navigateTo={navigateTo} 
            settings={settings}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsPage 
            navigateTo={navigateTo} 
            settings={settings}
            updateSettings={updateSettings}
          />
        )}
        {currentScreen === 'ai-prompt' && (
          <AIPromptPage settings={settings} />
        )}
        {currentScreen === 'games' && (
          <GamesPage settings={settings} />
        )}
        {currentScreen === 'articles' && (
          <ArticlesListPage settings={settings} navigateTo={navigateTo} />
        )}
      </div>
    </ConversationProvider>
  );
}

export default App;