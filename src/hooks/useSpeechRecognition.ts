
import { useState, useRef, useEffect } from "react";

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const isSpeechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    setSpeechRecognitionSupported(isSpeechRecognitionSupported);
    
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = false;
        speechRecognitionRef.current.interimResults = false;
        
        speechRecognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        };
        
        speechRecognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event);
          setIsListening(false);
        };
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        setSpeechRecognitionSupported(false);
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (error) {
          console.error("Error cleaning up speech recognition:", error);
        }
      }
    };
  }, [onResult]);

  const startListening = () => {
    if (speechRecognitionSupported && speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Could not start speech recognition', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
        setIsListening(false);
      } catch (error) {
        console.error('Could not stop speech recognition', error);
      }
    }
  };

  return {
    isListening,
    speechRecognitionSupported,
    startListening,
    stopListening
  };
}
