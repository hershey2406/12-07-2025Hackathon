import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Settings } from '../App';

interface VoiceInputButtonProps {
  onCommand: (command: string) => void;
  settings: Settings;
}

export function VoiceInputButton({ onCommand, settings }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const isDark = settings.darkMode;

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        onCommand('read news');
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleVoiceInput}
        className={`w-20 h-20 rounded-full ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white shadow-xl transition-all transform hover:scale-110 flex items-center justify-center ${settings.highContrast ? 'ring-4 ring-yellow-400' : ''}`}
        aria-label="Voice input"
      >
        {isListening ? (
          <MicOff className="w-10 h-10" strokeWidth={2.5} />
        ) : (
          <Mic className="w-10 h-10" strokeWidth={2.5} />
        )}
      </button>
      <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {isListening ? 'Listening...' : 'Tap to speak'}
      </p>
    </div>
  );
}