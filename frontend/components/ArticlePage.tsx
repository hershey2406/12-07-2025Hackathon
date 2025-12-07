import { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Send, Sparkles, VolumeX, Mic } from 'lucide-react';
import { Screen, Article, Settings } from '../App';
import { fetchArticleSummary } from '../apis/api';

interface ArticlePageProps {
  article: Article;
  navigateTo: (screen: Screen, category?: string, article?: Article) => void;
  settings: Settings;
}

export function ArticlePage({ article, navigateTo, settings }: ArticlePageProps) {
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [customResponse, setCustomResponse] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);
  const [isSpeakingCustom, setIsSpeakingCustom] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isDark = settings.darkMode;

  // Load article summary when component mounts
  useEffect(() => {
    const loadSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const summary = await fetchArticleSummary(article.title, article.content);
        setAiResponse(summary);
      } catch (error) {
        console.error('Error loading summary:', error);
        setAiResponse('Unable to load summary. Please try again later.');
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article]);

  const handleReadAloudSummary = () => {
    if ('speechSynthesis' in window) {
      if (isSpeakingSummary) {
        window.speechSynthesis.cancel();
        setIsSpeakingSummary(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = settings.readAloudSpeed;
        utterance.onend = () => setIsSpeakingSummary(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeakingSummary(true);
      }
    }
  };

  const handleReadAloudCustom = () => {
    if ('speechSynthesis' in window) {
      if (isSpeakingCustom) {
        window.speechSynthesis.cancel();
        setIsSpeakingCustom(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(customResponse);
        utterance.rate = settings.readAloudSpeed;
        utterance.onend = () => setIsSpeakingCustom(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeakingCustom(true);
      }
    }
  };

  const handleSubmitPrompt = async () => {
    if (userPrompt.trim()) {
      setIsThinking(true);
      try {
        // Call API to get AI response based on user's question and article content
        const response = await fetchArticleSummary(userPrompt, article.content);
        setCustomResponse(response);
        setUserPrompt('');
      } catch (error) {
        console.error('Error getting AI response:', error);
        setCustomResponse('Unable to process your request. Please try again later.');
      } finally {
        setIsThinking(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserPrompt(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'} pb-32`}>
      <div className="max-w-7xl mx-auto p-6 pt-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigateTo('articles')}
            className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-50 text-slate-700'} px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-3 border-2 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-xl">Back to Articles</span>
          </button>
          
          <div className={`${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white px-6 py-3 rounded-xl text-lg`}>
            {article.category}
          </div>
        </div>

        {/* Article Title */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-fadeIn`}>
          <h1 className={`text-3xl leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {article.title}
          </h1>
          <p className={`text-lg mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {article.date}
          </p>
        </div>

        {/* Two Column Layout: Summary and Ask */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Section */}
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-fadeIn`} style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2.5} />
                <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Summary
                </h2>
              </div>
              <button
                onClick={handleReadAloudSummary}
                disabled={!aiResponse || isLoadingSummary}
                className={`${isSpeakingSummary ? 'bg-red-500 hover:bg-red-600' : isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isSpeakingSummary ? (
                  <>
                    <VolumeX className="w-6 h-6" strokeWidth={2.5} />
                    <span className="text-lg">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-6 h-6" strokeWidth={2.5} />
                    <span className="text-lg">Read</span>
                  </>
                )}
              </button>
            </div>

            <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-xl min-h-[300px] ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}>
              {isLoadingSummary ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Loading summary...
                  </span>
                </div>
              ) : (
                <p className={`text-xl leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ lineHeight: '1.8' }}>
                  {aiResponse}
                </p>
              )}
            </div>
          </div>

          {/* Ask About Article Section */}
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-8 rounded-2xl shadow-lg ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''} animate-slideUp flex flex-col min-h-[400px]`} style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2.5} />
              <h2 className={`text-2xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Ask About This Article
              </h2>
            </div>

            {/* Custom Response Box - Shows Above Input */}
            {(customResponse || isThinking) && (
              <div className="animate-fadeIn mb-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl ${isDark ? 'text-white' : 'text-slate-800'}`}>Response</h3>
                  <button
                    onClick={handleReadAloudCustom}
                    disabled={!customResponse || isThinking}
                    className={`${isSpeakingCustom ? 'bg-red-500 hover:bg-red-600' : isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isSpeakingCustom ? (
                      <>
                        <VolumeX className="w-6 h-6" strokeWidth={2.5} />
                        <span className="text-lg">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-6 h-6" strokeWidth={2.5} />
                        <span className="text-lg">Read</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-xl min-h-[200px] ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}>
                  {isThinking ? (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Thinking...
                      </span>
                    </div>
                  ) : (
                    <p className={`text-xl leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ lineHeight: '1.8' }}>
                      {customResponse}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Spacer to push input to bottom */}
            {!customResponse && !isThinking && <div className="flex-1"></div>}

            {/* Input Box - Always at Bottom */}
            <div className="mt-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? 'Listening...' : 'Ask a question about this article...'}
                  className={`flex-1 ${isDark ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-white text-slate-800 placeholder-slate-400'} px-6 py-4 rounded-xl border-2 ${isDark ? 'border-slate-600' : 'border-slate-200'} focus:outline-none focus:border-blue-500 text-lg`}
                  disabled={isThinking || isListening}
                />
                <button
                  onClick={handleVoiceInput}
                  disabled={isThinking || isListening}
                  className={`${isListening ? 'bg-red-500 animate-pulse' : isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleSubmitPrompt}
                  disabled={!userPrompt.trim() || isThinking}
                  className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <Send className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}