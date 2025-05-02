
export interface LogEntry {
  timestamp: string;
  type: "system" | "info" | "error" | "success" | "command" | "search";
  message: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  isActive: boolean;
}

export type AgentType = 
  | "primary" 
  | "research" 
  | "workflow" 
  | "data" 
  | "learning";

export type AgentStatus = 
  | "idle" 
  | "processing" 
  | "error" 
  | "success";

export type AgentCapability = 
  | "conversation" 
  | "search" 
  | "workflow" 
  | "data-query" 
  | "learning";

export interface AgentTask {
  id: string;
  agentId: string;
  type: AgentTaskType;
  status: AgentTaskStatus;
  data: any;
  result?: any;
  timestamp: string;
}

export type AgentTaskType = 
  | "conversation" 
  | "search" 
  | "workflow" 
  | "data-query" 
  | "learning";

export type AgentTaskStatus = 
  | "pending" 
  | "in-progress" 
  | "completed" 
  | "failed";

export interface AgentMessage {
  from: string;
  to: string;
  content: any;
  type: "request" | "response" | "notification";
  timestamp: string;
}

export interface AgentNetwork {
  agents: Agent[];
  activeAgents: string[];
  messages: AgentMessage[];
}
