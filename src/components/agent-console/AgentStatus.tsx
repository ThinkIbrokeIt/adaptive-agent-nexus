
import React from "react";
import { Agent } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Workflow, Database, Lightbulb } from "lucide-react";

interface AgentStatusProps {
  agents: Agent[];
}

const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
  // Function to get the appropriate icon for each agent type
  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case "primary":
        return <Brain className="h-3 w-3 mr-1" />;
      case "research":
        return <Search className="h-3 w-3 mr-1" />;
      case "workflow":
        return <Workflow className="h-3 w-3 mr-1" />;
      case "data":
        return <Database className="h-3 w-3 mr-1" />;
      case "learning":
        return <Lightbulb className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Function to determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-slate-600/30 text-slate-400 border-slate-600";
      case "processing":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-600";
      case "error":
        return "bg-red-900/30 text-red-400 border-red-600";
      case "success":
        return "bg-green-900/30 text-green-400 border-green-600";
      default:
        return "bg-slate-600/30 text-slate-400 border-slate-600";
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {agents.map((agent) => (
        <Badge 
          key={agent.id}
          variant="outline" 
          className={`${getStatusColor(agent.status)} ${!agent.isActive && 'opacity-50'}`}
        >
          {getAgentIcon(agent.type)}
          {agent.name}
          {agent.status === "processing" && (
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
          )}
        </Badge>
      ))}
    </div>
  );
};

export default AgentStatus;
