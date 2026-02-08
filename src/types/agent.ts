
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
  | "adaptive"
  | "spawned";

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
  | "learning"
  | "analysis"
  | "communication"
  | "coordination"
  | "adaptation"
  | "spawning";

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
  spawnedAgents: SpawnedAgent[];
  recentTriggers: McpWorkflowTrigger[];
}

export interface SpawnedAgent {
  id: string;
  name: string;
  baseAgentId: string;
  specialization: string;
  trainingData: TrainingExample[];
  capabilities: AgentCapability[];
  performance: AgentPerformance;
  createdAt: string;
  lastTrained: string;
  isExported: boolean;
}

export interface TrainingExample {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  feedback: "positive" | "negative" | "neutral";
  timestamp: string;
}

export interface AgentPerformance {
  accuracy: number;
  responseTime: number;
  successRate: number;
  totalInteractions: number;
}

export interface AgentSpawner {
  spawnAgent: (config: SpawnAgentConfig) => Promise<SpawnedAgent>;
  trainAgent: (agentId: string, examples: TrainingExample[]) => Promise<void>;
  exportAgent: (agentId: string) => Promise<AgentExport>;
  importAgent: (agentExport: AgentExport) => Promise<SpawnedAgent>;
}

export interface SpawnAgentConfig {
  name: string;
  specialization: string;
  baseCapabilities: AgentCapability[];
  initialTrainingData?: TrainingExample[];
}

export interface AgentExport {
  agent: SpawnedAgent;
  trainingData: TrainingExample[];
  metadata: {
    exportedAt: string;
    version: string;
    sourceSystem: string;
  };
}

// MCP Workflow Types
export interface McpWorkflowTrigger {
  id: string;
  type: 'user_input' | 'system_event' | 'data_change' | 'scheduled';
  source: string;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface McpWorkflowContext {
  trigger: McpWorkflowTrigger;
  userContext?: {
    preferences: Record<string, any>;
    history: AgentMessage[];
    profile: Record<string, any>;
  };
  systemContext?: {
    activeAgents: string[];
    systemMetrics: Record<string, any>;
    availableResources: string[];
  };
  enrichedData?: any;
}

export interface McpWorkflowResult {
  phase: 'monitor' | 'contextualize' | 'personalize';
  success: boolean;
  data: any;
  confidence: number;
  processingTime: number;
  nextPhase?: 'contextualize' | 'personalize' | 'complete';
}

export interface McpWorkflowProcessor {
  processTrigger: (trigger: McpWorkflowTrigger) => Promise<McpWorkflowResult>;
  enrichContext: (context: McpWorkflowContext) => Promise<McpWorkflowResult>;
  personalizeResponse: (context: McpWorkflowContext, enrichedData: any) => Promise<McpWorkflowResult>;
  executeWorkflow: (trigger: McpWorkflowTrigger) => Promise<McpWorkflowResult>;
}
