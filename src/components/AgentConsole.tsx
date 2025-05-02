
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleArrowUp } from "lucide-react";
import { LogEntry } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { useAgentCommands } from "@/hooks/useAgentCommands";
import ConsoleLog from "./agent-console/ConsoleLog";
import CommandInput from "./agent-console/CommandInput";
import AgentStatus from "./agent-console/AgentStatus";

const initialLogs: LogEntry[] = [
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
];

const AgentConsole = () => {
  const agentNetwork = useAgentNetwork();
  const { 
    logs, 
    isListening, 
    isSearching, 
    feedbackEnabled,
    voiceEnabled,
    setVoiceEnabled,
    handleCommand
  } = useAgentCommands(initialLogs);

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
            <Badge variant="outline" className="font-mono">v0.7.0-alpha</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentStatus agents={agentNetwork.network.agents} />
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
