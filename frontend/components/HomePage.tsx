import { Newspaper } from 'lucide-react';
import { Settings } from '../App';

interface HomePageProps {
  settings: Settings;
}

const newsArticles = [
  { id: 1, category: 'World', title: 'International climate summit reaches historic agreement' },
  { id: 2, category: 'Technology', title: 'New smartphone breakthrough improves battery life by 50%' },
  { id: 3, category: 'Health', title: 'Study shows daily walking reduces health risks significantly' },
  { id: 4, category: 'Business', title: 'Local businesses report strong growth this quarter' },
  { id: 5, category: 'Sports', title: 'Olympic athletes prepare for upcoming summer games' },
  { id: 6, category: 'Science', title: 'Researchers discover new species in deep ocean exploration' },
  { id: 7, category: 'Entertainment', title: 'Classic film festival celebrates 50 years of cinema' },
  { id: 8, category: 'Politics', title: 'New education policy focuses on digital literacy' },
  { id: 9, category: 'Weather', title: 'Meteorologists predict mild temperatures for the weekend' },
  { id: 10, category: 'Community', title: 'Volunteers plant 1,000 trees in local park initiative' },
];

export function HomePage({ settings }: HomePageProps) {
  const isDark = settings.darkMode;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 pt-20 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className={`p-6 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} transform hover:scale-110 hover:rotate-6`}>
              <Newspaper className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '3em' }}>
            Simple News for You
          </h1>
          <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`} style={{ fontSize: '1.5em' }}>
            Stay informed with easy-to-read news
          </p>
        </div>

        {/* Description Card */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-3xl shadow-xl animate-scaleIn ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <h2 className={`mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '2em' }}>
            Welcome!
          </h2>
          <p className={`leading-relaxed mb-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontSize: '1.5em', lineHeight: '2' }}>
            This website helps you read and understand the news easily. We provide simple explanations, large text, and helpful tools to make staying informed, comfortable, and enjoyable.
          </p>
          <div className={`${isDark ? 'bg-slate-700' : 'bg-blue-50'} p-8 rounded-2xl mt-8`}>
            <h3 className={`mb-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '1.5em' }}>
              How to Navigate:
            </h3>
            <ul className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '1.25em', lineHeight: '1.8' }}>
              <li className="flex items-start gap-3">
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.2em' }}>•</span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-900'}>Home:</strong> You are here! This page welcomes you to the site and shows today's top news stories.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.2em' }}>•</span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-900'}>Articles:</strong> Browse news articles by category (Economic, Health, Defense). Click on any article to read its summary and ask questions about it.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.2em' }}>•</span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-900'}>AI Assistant:</strong> Chat with our AI assistant about any news topic. Use your voice or type your questions to get simple, easy-to-understand answers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.2em' }}>•</span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-900'}>Settings:</strong> Adjust text size, reading speed, dark mode, and other options to suit your comfort and needs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.2em' }}>•</span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-900'}>Games:</strong> Enjoy daily crossword puzzles and trivia quizzes to keep your mind active while having fun.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* News Ticker - Scrolling Headlines */}
        <div id="news-ticker" className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-6 rounded-3xl shadow-xl overflow-hidden ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <h3 className={`mb-4 text-center ${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '1.5em' }}>
            Today's Top Stories
          </h3>
          <div className="relative overflow-hidden">
            <div className="news-ticker-container">
              <div className="news-ticker">
                {[...newsArticles, ...newsArticles].map((article, index) => (
                  <div
                    key={`${article.id}-${index}`}
                    className={`inline-flex items-center px-6 py-3 mx-3 rounded-xl ${
                      isDark ? 'bg-slate-700' : 'bg-blue-50'
                    } whitespace-nowrap`}
                  >
                    <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'} mr-3`} style={{ fontSize: '1.2em' }}>
                      [{article.category}]
                    </span>
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'} style={{ fontSize: '1.2em' }}>
                      {article.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className={`text-center animate-slideUp ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ animationDelay: '0.2s', fontSize: '1.25em' }}>
          <p>
            Use the tabs at the top of the page to get started!
          </p>
        </div>
      </div>
    </div>
  );
}