
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpeechControls from "./SpeechControls";

interface CommandInputProps {
  onCommandSubmit: (command: string) => void;
  isListening: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  onCommandSubmit,
  isListening,
  voiceEnabled,
  setVoiceEnabled
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onCommandSubmit(input);
    setInput("");
  };

  const handleSpeechInput = (text: string) => {
    setInput(text);
    onCommandSubmit(text);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
      <div className="flex items-center bg-black rounded-md px-3 text-slate-400 font-mono">
        &gt;
      </div>
      <Input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type command or ask a question..."
        className="flex-1 bg-black border-slate-700 font-mono text-sm"
        disabled={isListening}
      />
      <SpeechControls
        onSpeechInput={handleSpeechInput}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />
      <Button type="submit" variant="outline">Execute</Button>
    </form>
  );
};

export default CommandInput;
