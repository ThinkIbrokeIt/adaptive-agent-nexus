
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CircleArrowUp } from "lucide-react";

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
    }
  ]);
  const { toast } = useToast();
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);

  const addLog = (type, message) => {
    setLogs(prev => [
      ...prev, 
      { 
        timestamp: new Date().toISOString(),
        type, 
        message 
      }
    ]);
  };

  const handleCommand = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    addLog("command", input);
    
    // Process command
    if (input.startsWith("run")) {
      const parts = input.split(" ");
      if (parts[1] === "workflow") {
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
      } else {
        addLog("error", `Unknown workflow: ${parts[1]}`);
      }
    } else if (input.startsWith("query")) {
      addLog("system", "Executing database query...");
      setTimeout(() => {
        addLog("info", "Query returned 5 results.");
      }, 1500);
    } else if (input.toLowerCase() === "help") {
      addLog("info", "Available commands: run workflow, query [db] [params], status, clear, feedback [on|off]");
    } else if (input.toLowerCase() === "status") {
      addLog("info", "System status: OPERATIONAL");
      addLog("info", "McP processors: ACTIVE (3/3)");
      addLog("info", "Memory usage: 1.2GB / 4GB");
      addLog("info", "Storage status: CONNECTED");
      addLog("info", `Feedback loop: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
    } else if (input.toLowerCase() === "clear") {
      setLogs([{
        timestamp: new Date().toISOString(),
        type: "system",
        message: "Console cleared."
      }]);
    } else if (input.toLowerCase().startsWith("feedback")) {
      const parts = input.toLowerCase().split(" ");
      if (parts.length > 1) {
        if (parts[1] === "on") {
          setFeedbackEnabled(true);
          addLog("success", "Feedback loop enabled. Agent will continuously learn from interactions.");
        } else if (parts[1] === "off") {
          setFeedbackEnabled(false);
          addLog("info", "Feedback loop disabled. Agent will not adapt from interactions.");
        } else {
          addLog("error", "Invalid feedback command. Use 'feedback on' or 'feedback off'");
        }
      } else {
        addLog("info", `Current feedback status: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
      }
    } else {
      addLog("error", `Unknown command: ${input}`);
    }
    
    setInput("");
    toast({
      title: "Command Executed",
      description: input,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <span>Agent Console</span>
              {feedbackEnabled && (
                <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-600">
                  <CircleArrowUp className="h-3 w-3 mr-1 animate-pulse" />
                  Learning
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="font-mono">v0.4.2-alpha</Badge>
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
              placeholder="Type command (help for options)..."
              className="flex-1 bg-black border-slate-700 font-mono text-sm"
            />
            <Button type="submit" variant="outline">Execute</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentConsole;
