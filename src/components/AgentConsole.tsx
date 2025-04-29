
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CircleArrowUp } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { LogEntry } from "@/types/agent";
import ConsoleLog from "./agent-console/ConsoleLog";
import CommandInput from "./agent-console/CommandInput";

const AgentConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speakText } = useSpeechSynthesis();

  const addLog = (type: LogEntry["type"], message: string) => {
    const newLog: LogEntry = { 
      timestamp: new Date().toISOString(),
      type, 
      message 
    };
    
    setLogs(prev => [...prev, newLog]);

    // Speak response for certain message types if voice is enabled
    if (voiceEnabled && (type === "info" || type === "success" || type === "system")) {
      speakText(message);
    }
  };

  const handleCommand = (commandText: string) => {
    addLog("command", commandText);
    
    // Process command
    if (commandText.toLowerCase().includes("run") && commandText.toLowerCase().includes("workflow")) {
      processWorkflowCommand();
    } else if (commandText.toLowerCase().includes("query")) {
      processQueryCommand();
    } else if (commandText.toLowerCase().includes("help")) {
      processHelpCommand();
    } else if (commandText.toLowerCase().includes("status")) {
      processStatusCommand();
    } else if (commandText.toLowerCase().includes("clear")) {
      processClearCommand();
    } else if (commandText.toLowerCase().includes("feedback")) {
      processFeedbackCommand(commandText);
    } else if (commandText.toLowerCase().includes("voice")) {
      processVoiceCommand(commandText);
    } else if (commandText.toLowerCase().includes("tell me about")) {
      processTellMeAboutCommand(commandText);
    } else {
      processConversationalQuery(commandText);
    }
    
    toast({
      title: "Command Executed",
      description: commandText,
    });
  };

  // Command processing methods
  const processWorkflowCommand = () => {
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
  };

  const processQueryCommand = () => {
    addLog("system", "Executing database query...");
    setTimeout(() => {
      addLog("info", "Query returned 5 results.");
    }, 1500);
  };

  const processHelpCommand = () => {
    addLog("info", "Available commands: run workflow, query [db] [params], status, clear, feedback [on|off], voice [on|off]");
  };

  const processStatusCommand = () => {
    addLog("info", "System status: OPERATIONAL");
    addLog("info", "McP processors: ACTIVE (3/3)");
    addLog("info", "Memory usage: 1.2GB / 4GB");
    addLog("info", "Storage status: CONNECTED");
    addLog("info", `Feedback loop: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
    addLog("info", `Voice interface: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
  };

  const processClearCommand = () => {
    setLogs([{
      timestamp: new Date().toISOString(),
      type: "system",
      message: "Console cleared."
    }]);
  };

  const processFeedbackCommand = (commandText: string) => {
    if (commandText.toLowerCase().includes("on")) {
      setFeedbackEnabled(true);
      addLog("success", "Feedback loop enabled. Agent will continuously learn from interactions.");
    } else if (commandText.toLowerCase().includes("off")) {
      setFeedbackEnabled(false);
      addLog("info", "Feedback loop disabled. Agent will not adapt from interactions.");
    } else {
      addLog("info", `Current feedback status: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
    }
  };

  const processVoiceCommand = (commandText: string) => {
    if (commandText.toLowerCase().includes("on")) {
      setVoiceEnabled(true);
      addLog("success", "Voice output enabled.");
    } else if (commandText.toLowerCase().includes("off")) {
      setVoiceEnabled(false);
      addLog("info", "Voice output disabled.");
    } else {
      addLog("info", `Current voice status: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
    }
  };

  const processTellMeAboutCommand = (commandText: string) => {
    const topic = commandText.toLowerCase().replace("tell me about", "").trim();
    addLog("system", `Retrieving information about "${topic}"...`);
    setTimeout(() => {
      addLog("info", `${topic} is part of the agent's knowledge base. It relates to adaptive learning systems that continuously evolve through feedback loops and context-aware interactions.`);
    }, 1500);
  };

  const processConversationalQuery = (commandText: string) => {
    addLog("system", "Processing conversational query...");
    setTimeout(() => {
      addLog("info", `Response to "${commandText}": I'm designed to assist with McP workflow operations and knowledge retrieval. My capabilities include monitoring user interactions, contextualizing data, personalizing responses, and learning through feedback loops.`);
    }, 1500);
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
            </div>
            <Badge variant="outline" className="font-mono">v0.5.0-alpha</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsoleLog logs={logs} />
        </CardContent>
        <CardFooter>
          <CommandInput 
            onCommandSubmit={handleCommand}
            isListening={isListening}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentConsole;
