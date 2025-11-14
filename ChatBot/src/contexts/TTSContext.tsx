import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

export interface TTSSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

interface TTSContextType {
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  isPaused: boolean;
  settings: TTSSettings;
  currentMessageId: string | null;
  speak: (text: string, messageId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  updateSettings: (newSettings: Partial<TTSSettings>) => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider = ({ children }: { children: ReactNode }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [settings, setSettings] = useState<TTSSettings>({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice with priority for Indian languages
      if (availableVoices.length > 0 && !settings.voice) {
        // Priority order: Hindi > English > Marathi > Other Indian languages > Others
        const priorityLanguages = ['hi-IN', 'en-US', 'en-GB', 'mr-IN', 'ta-IN', 'te-IN', 'gu-IN', 'bn-IN'];
        
        let defaultVoice = null;
        
        // Try to find voice by priority
        for (const lang of priorityLanguages) {
          defaultVoice = availableVoices.find(v => v.lang === lang);
          if (defaultVoice) break;
        }
        
        // Fallback to first voice with preferred patterns
        if (!defaultVoice) {
          defaultVoice = availableVoices.find(v => 
            v.lang.startsWith('hi') || 
            v.lang.startsWith('mr') || 
            v.lang.startsWith('en')
          ) || availableVoices[0];
        }
        
        setSettings(prev => ({ ...prev, voice: defaultVoice }));
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback((text: string, messageId: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    setCurrentMessageId(messageId);

    if (settings.voice) {
      utterance.voice = settings.voice;
    }
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentMessageId(null);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentMessageId(null);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, [settings]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentMessageId(null);
    utteranceRef.current = null;
  }, []);

  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <TTSContext.Provider
      value={{
        voices,
        isSpeaking,
        isPaused,
        settings,
        currentMessageId,
        speak,
        pause,
        resume,
        stop,
        updateSettings,
      }}
    >
      {children}
    </TTSContext.Provider>
  );
};

export const useTextToSpeech = () => {
  const context = useContext(TTSContext);
  if (context === undefined) {
    throw new Error("useTextToSpeech must be used within a TTSProvider");
  }
  return context;
};
