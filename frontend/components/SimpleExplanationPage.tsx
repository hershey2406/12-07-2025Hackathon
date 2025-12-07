import { ArrowLeft, Lightbulb, BookOpen, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Screen, Article, Settings } from '../App';

interface SimpleExplanationPageProps {
  article: Article;
  navigateTo: (screen: Screen, category?: string, article?: Article) => void;
  settings: Settings;
}

export function SimpleExplanationPage({ article, navigateTo, settings }: SimpleExplanationPageProps) {
  const [isReading, setIsReading] = useState(false);
  const isDark = settings.darkMode;

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const fullText = `${article.summary}. What this means for you: ${article.meaningForYou}. Important terms: ${article.terms.map(t => `${t.term}: ${t.definition}`).join('. ')}`;
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = settings.readAloudSpeed;
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'} p-6 pt-20`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigateTo('articles')}
            className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-slate-700'} px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3 border-2 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xl">Back to Articles</span>
          </button>

          <button
            onClick={handleReadAloud}
            className={`${isReading ? 'bg-red-500 hover:bg-red-600' : isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3`}
          >
            <Volume2 className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xl">{isReading ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>
        </div>

        {/* Title */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg text-center ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} mb-4`}>
            <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className={`text-3xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Simple Explanation
          </h1>
        </div>

        {/* Summary */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <h2 className={`text-2xl mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {article.title}
          </h2>
          <p className={`text-xl leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ lineHeight: '1.8' }}>
            {article.summary}
          </p>
        </div>

        {/* What This Means for You */}
        <div className={`${isDark ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-green-500 to-green-600'} p-8 rounded-2xl shadow-lg text-white ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-10 h-10" strokeWidth={2.5} />
            <h2 className="text-2xl">What This Means for You</h2>
          </div>
          <p className="text-xl leading-relaxed" style={{ lineHeight: '1.8' }}>
            {article.meaningForYou}
          </p>
        </div>

        {/* Important Terms */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <h2 className={`text-2xl mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Important Terms Explained
          </h2>
          <div className="space-y-4">
            {article.terms.map((term, index) => (
              <div 
                key={index} 
                className={`${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-6 rounded-xl`}
              >
                <h3 className={`text-xl mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {term.term}
                </h3>
                <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {term.definition}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigateTo('categories')}
            className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-8 py-5 rounded-xl text-xl shadow-lg transition-all`}
          >
            Browse More News
          </button>
        </div>
      </div>
    </div>
  );
}