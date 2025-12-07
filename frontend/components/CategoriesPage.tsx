import { Home, Landmark, Globe, Heart, AlertCircle, Tv, ArrowLeft } from 'lucide-react';
import { Screen, Settings } from '../App';
import { mockArticles } from './mockData';

interface CategoriesPageProps {
  navigateTo: (screen: Screen, category?: string, article?: any) => void;
  settings: Settings;
}

const categories = [
  { name: 'Breaking News', icon: AlertCircle, color: 'red', articles: mockArticles.filter(a => a.category === 'Breaking News') },
  { name: 'Politics', icon: Landmark, color: 'blue', articles: mockArticles.filter(a => a.category === 'Politics') },
  { name: 'Economy', icon: Home, color: 'green', articles: mockArticles.filter(a => a.category === 'Economy') },
  { name: 'World', icon: Globe, color: 'purple', articles: mockArticles.filter(a => a.category === 'World') },
  { name: 'Health', icon: Heart, color: 'pink', articles: mockArticles.filter(a => a.category === 'Health') },
  { name: 'Entertainment', icon: Tv, color: 'orange', articles: mockArticles.filter(a => a.category === 'Entertainment') }
];

export function CategoriesPage({ navigateTo, settings }: CategoriesPageProps) {
  const isDark = settings.darkMode;

  const handleCategoryClick = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (category && category.articles.length > 0) {
      navigateTo('article', categoryName, category.articles[0]);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'} p-6 pt-20`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-slate-700'} px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3 border-2 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xl">Back to Home</span>
          </button>
        </div>

        <h1 className={`text-4xl text-center ${isDark ? 'text-white' : 'text-slate-800'} animate-fadeIn`}>
          Choose a News Category
        </h1>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const colorClasses = {
              red: isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600',
              blue: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
              green: isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
              purple: isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
              pink: isDark ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600',
              orange: isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
            };

            return (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`${colorClasses[category.color as keyof typeof colorClasses]} text-white p-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:-rotate-1 flex flex-col items-center gap-4 ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-scaleIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-16 h-16 transform group-hover:scale-110" strokeWidth={2.5} />
                <span className="text-2xl text-center">{category.name}</span>
                <span className="text-lg opacity-90">
                  {category.articles.length} {category.articles.length === 1 ? 'article' : 'articles'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}