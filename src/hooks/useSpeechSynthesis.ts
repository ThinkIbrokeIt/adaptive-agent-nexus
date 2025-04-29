
import { useState, useRef, useEffect } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSynthesisSupported, setVoiceSynthesisSupported] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const isSynthesisSupported = 'speechSynthesis' in window;
    setVoiceSynthesisSupported(isSynthesisSupported);

    if (isSynthesisSupported) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      
      const handleSpeakEnd = () => setIsSpeaking(false);
      
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onend = handleSpeakEnd;
        speechSynthesisRef.current.onerror = handleSpeakEnd;
      }
    }
    
    return () => {
      if (isSynthesisSupported) {
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.onend = null;
          speechSynthesisRef.current.onerror = null;
        }
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!voiceSynthesisSupported || !speechSynthesisRef.current) return;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      speechSynthesisRef.current.text = text;
      window.speechSynthesis.speak(speechSynthesisRef.current);
    } catch (error) {
      console.error("Error speaking text:", error);
      setIsSpeaking(false);
    }
  };

  return { 
    isSpeaking, 
    voiceSynthesisSupported, 
    speakText 
  };
}
