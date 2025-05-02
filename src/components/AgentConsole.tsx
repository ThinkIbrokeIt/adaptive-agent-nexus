import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CircleArrowUp } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { LogEntry, SearchResult } from "@/types/agent";
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
    },
    {
      timestamp: new Date("2025-04-23T14:32:30Z").toISOString(),
      type: "system",
      message: "Search capability enabled. You can search for information using the 'search' command.",
    }
  ]);
  const { toast } = useToast();
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speakText } = useSpeechSynthesis();
  const [isSearching, setIsSearching] = useState(false);

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
    } else if (commandText.toLowerCase().startsWith("search ")) {
      processSearchCommand(commandText);
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
    addLog("info", "Available commands: run workflow, query [db] [params], status, clear, search [query], feedback [on|off], voice [on|off]");
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
    
    if (topic.length > 0) {
      // Check if we need to search for more information
      const knownTopics = ["mcp", "workflows", "feedback loops", "adaptive learning"];
      const isKnown = knownTopics.some(t => topic.includes(t));
      
      if (!isKnown) {
        addLog("system", `Limited information found. Initiating search for "${topic}"...`);
        setTimeout(() => {
          processSearchCommand(`search ${topic}`);
        }, 1000);
        return;
      }
    }
    
    setTimeout(() => {
      addLog("info", `${topic} is part of the agent's knowledge base. It relates to adaptive learning systems that continuously evolve through feedback loops and context-aware interactions.`);
    }, 1500);
  };

  const processSearchCommand = (commandText: string) => {
    const query = commandText.toLowerCase().replace("search", "").trim();
    
    if (!query) {
      addLog("error", "Please provide a search query. Example: search artificial intelligence");
      return;
    }
    
    addLog("system", `Searching for "${query}"...`);
    setIsSearching(true);
    
    // Simulate search operation
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          title: `Research Paper: Advances in ${query}`,
          snippet: `Recent developments in ${query} show promising results for adaptive learning systems and contextual awareness.`,
          url: `https://research.example.com/${query.replace(/\s+/g, '-')}`
        },
        {
          title: `Understanding ${query} in Modern Systems`,
          snippet: `${query} has revolutionized how we approach data processing and contextual learning in AI frameworks.`,
          url: `https://academy.example.com/topics/${query.replace(/\s+/g, '-')}`
        },
        {
          title: `${query} Implementation Guide`,
          snippet: `Step-by-step instructions for implementing ${query} in your McP workflow architecture.`,
          url: `https://docs.example.com/guides/${query.replace(/\s+/g, '-')}`
        }
      ];
      
      addLog("search", JSON.stringify(mockResults));
      
      setTimeout(() => {
        addLog("success", `Search completed. Found ${mockResults.length} relevant results for "${query}".`);
        addLog("system", "Knowledge base updated with new information.");
        setIsSearching(false);
      }, 500);
    }, 2000);
  };

  const processConversationalQuery = (commandText: string) => {
    addLog("system", "Processing conversational query...");
    
    // Check if we need to search for information to answer this query
    const searchTerms = [
      "what is", "how does", "explain", "who is", "when was", "where is",
      "why is", "can you tell me about", "information on", "data on"
    ];
    
    const shouldSearch = searchTerms.some(term => commandText.toLowerCase().includes(term));
    
    if (shouldSearch) {
      // Extract potential search topic
      let searchQuery = commandText;
      searchTerms.forEach(term => {
        if (commandText.toLowerCase().includes(term)) {
          searchQuery = commandText.toLowerCase().split(term)[1].trim();
          return;
        }
      });
      
      if (searchQuery && searchQuery !== commandText) {
        addLog("system", `Searching for more information on "${searchQuery}" to provide a better response...`);
        setTimeout(() => {
          processSearchCommand(`search ${searchQuery}`);
        }, 1000);
        
        setTimeout(() => {
          addLog("info", `Based on the search results and my knowledge, ${searchQuery} is related to advanced information processing and adaptive systems. The McP framework can incorporate this information to enhance contextual understanding.`);
        }, 4500);
        return;
      }
    }
    
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
              {isSearching && (
                <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-400 border-blue-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400 mr-1 animate-ping"></span>
                  Searching
                </Badge>
              )}
              {feedbackEnabled && (
                <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-600">
                  <CircleArrowUp className="h-3 w-3 mr-1 animate-pulse" />
                  Learning
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="font-mono">v0.6.0-alpha</Badge>
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
