import { useState, useEffect, useRef } from 'react';
import { Send, Volume2, VolumeX, Mic, Sparkles, AlertCircle, X } from 'lucide-react';
import { Settings } from '../App';
import { useConversation } from '../context/ConversationContext';
import { VOICE_CONFIG, VOICE_PREFERENCE } from '../config/voice';

interface AIPromptPageProps {
  settings: Settings;
}

export function AIPromptPage({ settings }: AIPromptPageProps) {
  const { conversation, addMessage, clearConversation, sendConversationToBackend, getAIResponse } = useConversation();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const isDark = settings.darkMode;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message to conversation
      addMessage(input, 'user', isListening);
      const userInput = input;
      setInput('');
      setIsThinking(true);

      try {
        // Get AI response from backend
        const aiResponse = await getAIResponse(userInput);
        
        // Add AI response to conversation
        addMessage(aiResponse, 'assistant');
        
        // Send conversation to backend for storage
        await sendConversationToBackend();
      } catch (error) {
        console.error('Error getting AI response:', error);
        addMessage('I apologize, but I encountered an error. Please try again.', 'assistant');
      } finally {
        setIsThinking(false);
      }
    }
  };

  const handleVoiceInput = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Request microphone permission first
      try {
        // This will trigger the browser's permission prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Permission granted - stop the stream and start speech recognition
        stream.getTracks().forEach(track => track.stop());
        
        setMicPermissionGranted(true);
        setMicPermissionDenied(false);
        
        // Now start speech recognition
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Error requesting microphone permission:', error);
        setMicPermissionDenied(true);
        setIsListening(false);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          // User denied permission
          console.log('Microphone permission denied by user');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.');
        } else {
          // Try starting speech recognition anyway (might already have permission)
          try {
            recognitionRef.current.start();
            setIsListening(true);
            setMicPermissionGranted(true);
          } catch (recognitionError) {
            console.error('Error starting speech recognition:', recognitionError);
          }
        }
      }
    }
  };

  const handleReadMessage = async (content: string) => {
    setIsSpeaking(true);
    
    try {
      // Try voice services in preference order
      for (const voiceType of VOICE_PREFERENCE) {
        if (voiceType === 'elevenlabs' && VOICE_CONFIG.elevenlabs.enabled) {
          try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_CONFIG.elevenlabs.voiceId}`, {
              method: 'POST',
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': VOICE_CONFIG.elevenlabs.apiKey
              },
              body: JSON.stringify({
                text: content,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                  style: 0.5,
                  use_speaker_boost: true
                }
              })
            });
            
            if (response.ok) {
              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              audio.playbackRate = settings.readAloudSpeed;
              await audio.play();
              
              audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
              };
              
              audio.onerror = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
              };
              
              return; // Success - exit function
            }
          } catch (error) {
            console.warn('ElevenLabs failed, trying next option:', error);
          }
        }
        
        if (voiceType === 'openai' && VOICE_CONFIG.openai.enabled) {
          try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${VOICE_CONFIG.openai.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: VOICE_CONFIG.openai.model,
                input: content,
                voice: VOICE_CONFIG.openai.voice,
                speed: settings.readAloudSpeed
              })
            });
            
            if (response.ok) {
              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              await audio.play();
              
              audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
              };
              
              audio.onerror = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
              };
              
              return; // Success - exit function
            }
          } catch (error) {
            console.warn('OpenAI TTS failed, trying next option:', error);
          }
        }
        
        if (voiceType === 'browser') {
          // Fallback: Browser speech synthesis
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(content);
            const voices = window.speechSynthesis.getVoices();
            
            // Try to find the best available browser voice
            const selectedVoice = voices.find(voice => 
              voice.name.includes('Google') || 
              voice.name.includes('Microsoft') ||
              voice.name.includes('Natural') ||
              voice.name.includes('Enhanced')
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
            
            utterance.rate = settings.readAloudSpeed;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            
            window.speechSynthesis.speak(utterance);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            return; // Success - exit function
          }
        }
      }
      
      // If all methods fail
      console.error('All text-to-speech methods failed');
      setIsSpeaking(false);
      
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  const handleStopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const suggestions = [
    'Explain today\'s top news',
    'What does inflation mean?',
    'Simplify this article for me',
    'Tell me about the weather'
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'} pb-32`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-6 rounded-2xl shadow-lg text-center ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2.5} />
            <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '2em' }}>
              AI Assistant
            </h1>
          </div>
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '1.2em' }}>
            Ask me anything about the news
          </p>
        </div>

        {/* Microphone Permission Warning */}
        {micPermissionDenied && (
          <div className={`${isDark ? 'bg-orange-900 border-orange-700' : 'bg-orange-100 border-orange-300'} border-2 p-6 rounded-2xl shadow-lg animate-fadeIn flex items-start gap-4`}>
            <AlertCircle className={`w-8 h-8 flex-shrink-0 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} strokeWidth={2.5} />
            <div className="flex-1">
              <h3 className={`${isDark ? 'text-orange-200' : 'text-orange-900'} mb-2`} style={{ fontSize: '1.5em' }}>
                Microphone Access Needed
              </h3>
              <p className={`${isDark ? 'text-orange-300' : 'text-orange-800'} mb-3`} style={{ fontSize: '1.1em', lineHeight: '1.6' }}>
                To use voice input, please allow microphone access in your browser settings:
              </p>
              <ol className={`list-decimal list-inside space-y-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`} style={{ fontSize: '1.1em', lineHeight: '1.6' }}>
                <li>Click the lock icon in your browser&apos;s address bar</li>
                <li>Find &quot;Microphone&quot; permissions</li>
                <li>Select &quot;Allow&quot;</li>
                <li>Refresh the page</li>
              </ol>
              <p className={`${isDark ? 'text-orange-400' : 'text-orange-700'} mt-3 italic`} style={{ fontSize: '1em' }}>
                You can still type your questions in the text box below!
              </p>
            </div>
            <button
              onClick={() => setMicPermissionDenied(false)}
              className={`flex-shrink-0 ${isDark ? 'text-orange-400 hover:text-orange-200' : 'text-orange-600 hover:text-orange-800'} transition-colors`}
              aria-label="Close warning"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div id="messages-area" className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[80%] p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] ${
                  message.type === 'user'
                    ? isDark 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDark
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-white text-slate-800'
                } ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <p className="leading-relaxed" style={{ fontSize: '1.25em', lineHeight: '1.8' }}>
                  {message.content}
                </p>
                {message.type === 'assistant' && (
                  <div className="flex gap-2 mt-4">
                    {!isSpeaking ? (
                      <button
                        onClick={() => handleReadMessage(message.content)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                        } transition-all transform hover:scale-105`}
                        style={{ fontSize: '1em' }}
                      >
                        <Volume2 className="w-5 h-5" strokeWidth={2.5} />
                        Read Aloud
                      </button>
                    ) : (
                      <button
                        onClick={handleStopReading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                        } text-white transition-all transform hover:scale-105`}
                        style={{ fontSize: '1em' }}
                      >
                        <VolumeX className="w-5 h-5" strokeWidth={2.5} />
                        Stop Reading
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex justify-start animate-fadeIn">
              <div className={`p-6 rounded-2xl shadow-lg ${
                isDark ? 'bg-slate-800' : 'bg-white'
              } ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-bounce-dot ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                  <div className={`w-3 h-3 rounded-full animate-bounce-dot ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                  <div className={`w-3 h-3 rounded-full animate-bounce-dot ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t p-4 shadow-2xl animate-slideUp`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              id="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your question here..."
              className={`flex-1 ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 text-slate-900 border-slate-300'} border-2 rounded-xl p-4 resize-none focus:ring-2 focus:ring-blue-500 ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}
              style={{ fontSize: '1.25em' }}
              rows={2}
            />

            <button
              id="voice-button"
              onClick={handleVoiceInput}
              className={`${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              } text-white p-4 rounded-xl shadow-lg transition-all flex-shrink-0 transform hover:scale-110 ${settings.highContrast ? 'ring-2 ring-yellow-400' : ''}`}
              aria-label="Voice input"
            >
              <Mic className="w-7 h-7" strokeWidth={2.5} />
            </button>

            <button
              id="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className={`${
                input.trim() && !isThinking
                  ? isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  : isDark ? 'bg-slate-700' : 'bg-slate-300'
              } text-white p-4 rounded-xl shadow-lg transition-all flex-shrink-0 transform hover:scale-110 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 ${settings.highContrast && input.trim() ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <Send className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}