
import React from "react";
import { Mic, MicOff, Volume, VolumeX } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface SpeechControlsProps {
  onSpeechInput: (text: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  onSpeechInput,
  voiceEnabled,
  setVoiceEnabled,
}) => {
  const { toast } = useToast();
  const { 
    isListening, 
    speechRecognitionSupported,
    startListening, 
    stopListening 
  } = useSpeechRecognition(onSpeechInput);
  
  const { isSpeaking } = useSpeechSynthesis();

  const toggleListening = () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please try a browser like Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoiceOutput = () => {
    if (!('speechSynthesis' in window) && !voiceEnabled) {
      toast({
        title: "Speech Synthesis Not Available",
        description: "Your browser doesn't support speech synthesis. Please try a browser like Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="flex space-x-2">
      <Toggle
        pressed={isListening}
        onPressedChange={toggleListening}
        aria-label="Toggle voice input"
        className={`${isListening ? 'bg-red-500 hover:bg-red-600' : speechRecognitionSupported ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600 opacity-50'} text-white`}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Toggle>
      <Toggle
        pressed={voiceEnabled}
        onPressedChange={toggleVoiceOutput}
        aria-label="Toggle voice output"
        className={`${voiceEnabled ? 'bg-purple-500 hover:bg-purple-600' : ('speechSynthesis' in window) ? 'bg-slate-500 hover:bg-slate-600' : 'bg-gray-500 hover:bg-gray-600 opacity-50'} text-white`}
      >
        {voiceEnabled ? <Volume className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Toggle>
      {isSpeaking && (
        <div className="inline-flex items-center bg-purple-900/30 text-purple-400 border border-purple-600 px-2 rounded-md text-xs">
          <Volume className="h-3 w-3 mr-1 animate-pulse" />
          Speaking
        </div>
      )}
    </div>
  );
};

export default SpeechControls;
