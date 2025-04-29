
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CircleArrowUp, Mic, MicOff, Speaker, Volume, VolumeX } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

const AgentConsole = () => {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([
    {
      timestamp: new Date("2025-04-23T14:32:05Z").toISOString(),
      type: "system",
      message: "Agent system initialized. McP framework ready.",
    },
    {
      timestamp: new Date("2025-04-23T14:32:10Z").toISOString(),
      type: "info",
      message: "Storage integrations connected: DuckDB, ChromaDB, SQLite, MinIO.",
    },
    {
      timestamp: new Date("2025-04-23T14:32:15Z").toISOString(),
      type: "info",
      message: "Local LLM initialized using llama3:instruct model.",
    },
    {
      timestamp: new Date("2025-04-23T14:32:20Z").toISOString(),
      type: "system",
      message: "Feedback loop enabled. Agent will continuously learn from interactions.",
    },
    {
      timestamp: new Date("2025-04-23T14:32:25Z").toISOString(),
      type: "system",
      message: "Voice interface activated. You can now speak to the agent.",
    }
  ]);
  const { toast } = useToast();
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    const isSpeechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    setSpeechRecognitionSupported(isSpeechRecognitionSupported);
    
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.interimResults = false;
      
      speechRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleCommand({ preventDefault: () => {} }, transcript);
      };
      
      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      speechRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        addLog("error", "Speech recognition error. Please try again.");
      };
    } else {
      // Log once to console instead of repeatedly showing UI alerts
      console.log("Speech recognition not supported in this browser.");
      addLog("error", "Speech recognition not supported in this browser. Voice input disabled.");
    }

    // Initialize speech synthesis if available
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
    } else {
      console.log("Speech synthesis not supported in this browser.");
      addLog("error", "Speech synthesis not supported in this browser. Voice output disabled.");
      setVoiceEnabled(false);
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const addLog = (type, message) => {
    setLogs(prev => [
      ...prev, 
      { 
        timestamp: new Date().toISOString(),
        type, 
        message 
      }
    ]);

    // Speak response for certain message types if voice is enabled
    if (voiceEnabled && (type === "info" || type === "success" || type === "system")) {
      speakText(message);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !speechSynthesisRef.current || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    speechSynthesisRef.current.text = text;
    speechSynthesisRef.current.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

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
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      setIsListening(false);
    } else {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
          setIsListening(true);
          addLog("system", "Listening for voice command...");
        } catch (error) {
          console.error('Speech recognition error', error);
          addLog("error", "Could not start speech recognition. Please try again.");
        }
      }
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
    addLog("system", `Voice output ${!voiceEnabled ? 'enabled' : 'disabled'}.`);
  };

  const handleCommand = (e, voiceInput = null) => {
    e.preventDefault();
    
    const commandText = voiceInput || input;
    if (!commandText.trim()) return;
    
    addLog("command", commandText);
    
    // Process command
    if (commandText.toLowerCase().includes("run") && commandText.toLowerCase().includes("workflow")) {
      addLog("system", "Initiating McP workflow...");
      setTimeout(() => {
        addLog("success", "Monitor phase completed. User interaction stored in DuckDB.");
      }, 1000);
      setTimeout(() => {
        addLog("success", "Contextualize phase completed. Knowledge vectors retrieved.");
      }, 3000);
      setTimeout(() => {
        addLog("success", "Personalize phase completed. Response generated.");
        
        if (feedbackEnabled) {
          setTimeout(() => {
            addLog("info", "Feedback loop activated. Processing response effectiveness...");
          }, 1000);
          setTimeout(() => {
            addLog("success", "Adaptation complete. Agent knowledge graph updated.");
          }, 3000);
        }
      }, 5000);
    } else if (commandText.toLowerCase().includes("query")) {
      addLog("system", "Executing database query...");
      setTimeout(() => {
        addLog("info", "Query returned 5 results.");
      }, 1500);
    } else if (commandText.toLowerCase().includes("help")) {
      addLog("info", "Available commands: run workflow, query [db] [params], status, clear, feedback [on|off], voice [on|off]");
    } else if (commandText.toLowerCase().includes("status")) {
      addLog("info", "System status: OPERATIONAL");
      addLog("info", "McP processors: ACTIVE (3/3)");
      addLog("info", "Memory usage: 1.2GB / 4GB");
      addLog("info", "Storage status: CONNECTED");
      addLog("info", `Feedback loop: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
      addLog("info", `Voice interface: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
    } else if (commandText.toLowerCase().includes("clear")) {
      setLogs([{
        timestamp: new Date().toISOString(),
        type: "system",
        message: "Console cleared."
      }]);
    } else if (commandText.toLowerCase().includes("feedback")) {
      if (commandText.toLowerCase().includes("on")) {
        setFeedbackEnabled(true);
        addLog("success", "Feedback loop enabled. Agent will continuously learn from interactions.");
      } else if (commandText.toLowerCase().includes("off")) {
        setFeedbackEnabled(false);
        addLog("info", "Feedback loop disabled. Agent will not adapt from interactions.");
      } else {
        addLog("info", `Current feedback status: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
      }
    } else if (commandText.toLowerCase().includes("voice")) {
      if (commandText.toLowerCase().includes("on")) {
        setVoiceEnabled(true);
        addLog("success", "Voice output enabled.");
      } else if (commandText.toLowerCase().includes("off")) {
        setVoiceEnabled(false);
        addLog("info", "Voice output disabled.");
      } else {
        addLog("info", `Current voice status: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
      }
    } else if (commandText.toLowerCase().includes("tell me about")) {
      const topic = commandText.toLowerCase().replace("tell me about", "").trim();
      addLog("system", `Retrieving information about "${topic}"...`);
      setTimeout(() => {
        addLog("info", `${topic} is part of the agent's knowledge base. It relates to adaptive learning systems that continuously evolve through feedback loops and context-aware interactions.`);
      }, 1500);
    } else {
      // Treat as a conversational query if it doesn't match any command
      addLog("system", "Processing conversational query...");
      setTimeout(() => {
        addLog("info", `Response to "${commandText}": I'm designed to assist with McP workflow operations and knowledge retrieval. My capabilities include monitoring user interactions, contextualizing data, personalizing responses, and learning through feedback loops.`);
      }, 1500);
    }
    
    setInput("");
    toast({
      title: "Command Executed",
      description: commandText,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Agent Console</span>
              {feedbackEnabled && (
                <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-600">
                  <CircleArrowUp className="h-3 w-3 mr-1 animate-pulse" />
                  Learning
                </Badge>
              )}
              {voiceEnabled && (
                <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-600">
                  <Speaker className="h-3 w-3 mr-1" />
                  Voice
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="outline" className="bg-purple-900/30 text-purple-400 border-purple-600">
                  <Volume className="h-3 w-3 mr-1 animate-pulse" />
                  Speaking
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="font-mono">v0.5.0-alpha</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-md p-3 font-mono text-xs h-80 overflow-y-auto flex flex-col space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="flex">
                <span className="text-slate-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span 
                  className={`mr-1 ${
                    log.type === "error" ? "text-red-500" : 
                    log.type === "success" ? "text-green-500" : 
                    log.type === "system" ? "text-yellow-500" :
                    log.type === "command" ? "text-cyan-500" :
                    "text-slate-300"
                  }`}
                >
                  {log.type === "command" ? ">" : log.type}:
                </span>
                <span className={`${log.type === "command" ? "text-white font-medium" : "text-slate-300"}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleCommand} className="flex w-full space-x-2">
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
            <Button type="submit" variant="outline">Execute</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentConsole;
