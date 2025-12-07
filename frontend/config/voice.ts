// Voice API Configuration
// Add your API keys here

// Get environment variables with proper typing
const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Client-side: use hardcoded values for now
    return undefined;
  }
  return (import.meta as any).env?.[key];
};

export const VOICE_CONFIG = {
  // ElevenLabs Configuration
  elevenlabs: {
    apiKey: getEnvVar('VITE_ELEVENLABS_API_KEY') || 'a26b1b6fd27fc856e397b5dbe03111278acbcac875e3e011636803a189be8ffc',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - friendly female voice
    // Other popular voice IDs:
    // 'pNInz6obpgDQGcFmaJgB' - Adam - male voice
    // '21m00Tcm4TlvDq8ikWAM' - Rachel - female voice
    // 'AZnzlk1XvdvUeBnXmlld' - Domi - female voice
    enabled: true // Enabled for ElevenLabs
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY') || 'YOUR_OPENAI_API_KEY',
    voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
    model: 'tts-1', // or 'tts-1-hd' for higher quality
    enabled: false // Set to true when you add your API key
  }
};

// Voice quality preference order
export const VOICE_PREFERENCE = [
  'elevenlabs', // Best quality
  'openai',     // Good quality
  'browser'     // Fallback
];