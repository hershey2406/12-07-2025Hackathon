import { createContext, useContext, useState, ReactNode } from 'react';
import { askQuestion } from '../apis/api';

export interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoiceInput?: boolean;
}

export interface Conversation {
  messages: Message[];
  sessionId: string;
  startedAt: Date;
}

interface ConversationContextType {
  conversation: Conversation;
  addMessage: (content: string, type: 'user' | 'assistant', isVoiceInput?: boolean) => void;
  clearConversation: () => void;
  sendConversationToBackend: () => Promise<void>;
  getAIResponse: (userMessage: string) => Promise<string>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Generate a unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversation, setConversation] = useState<Conversation>({
    messages: [
      {
        id: 1,
        type: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you understand news, answer questions, or explain complex topics in simple terms. How can I help you today?',
        timestamp: new Date(),
        isVoiceInput: false
      }
    ],
    sessionId: generateSessionId(),
    startedAt: new Date()
  });

  const addMessage = (content: string, type: 'user' | 'assistant', isVoiceInput: boolean = false) => {
    const newMessage: Message = {
      id: conversation.messages.length + 1,
      type,
      content,
      timestamp: new Date(),
      isVoiceInput
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const clearConversation = () => {
    setConversation({
      messages: [
        {
          id: 1,
          type: 'assistant',
          content: 'Hello! I\'m your AI assistant. I can help you understand news, answer questions, or explain complex topics in simple terms. How can I help you today?',
          timestamp: new Date(),
          isVoiceInput: false
        }
      ],
      sessionId: generateSessionId(),
      startedAt: new Date()
    });
  };

  const sendConversationToBackend = async () => {
    try {
      // TODO: Replace with your actual backend API endpoint
      const response = await fetch('YOUR_BACKEND_API_ENDPOINT/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication headers here
          // 'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          sessionId: conversation.sessionId,
          startedAt: conversation.startedAt,
          messages: conversation.messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp,
            isVoiceInput: msg.isVoiceInput
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send conversation to backend');
      }

      const data = await response.json();
      console.log('Conversation saved successfully:', data);
    } catch (error) {
      console.error('Error sending conversation to backend:', error);
      // For now, just log the conversation to console
      console.log('Conversation data:', {
        sessionId: conversation.sessionId,
        startedAt: conversation.startedAt,
        messages: conversation.messages
      });
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Use the real backend API
      const response = await askQuestion(userMessage);
      return response.answer || 'I apologize, but I couldn\'t generate a response.';
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if the backend is unavailable
      return `I understand you're asking about "${userMessage}". I'm currently unable to connect to the AI service, but I'd be happy to help you understand this topic once the connection is restored. Please try again in a moment.`;
    }
  };

  return (
    <ConversationContext.Provider 
      value={{ 
        conversation, 
        addMessage, 
        clearConversation, 
        sendConversationToBackend,
        getAIResponse
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}
