
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AgentNetwork, Agent, AgentMessage, AgentTask, AgentStatus, AgentCapability, SpawnedAgent, AgentSpawner, SpawnAgentConfig, AgentExport, TrainingExample, McpWorkflowTrigger, McpWorkflowContext, McpWorkflowResult, McpWorkflowProcessor } from "@/types/agent";
import { v4 as uuidv4 } from "uuid";
import { generateLLMResponse, createSystemMessage, createUserMessage, AGENT_PROMPTS } from "@/lib/llm";

// Initial set of agents
const initialAgents: Agent[] = [
  {
    id: "primary-agent",
    name: "Primary Agent",
    type: "primary",
    status: "idle",
    capabilities: ["conversation", "coordination", "spawning"],
    isActive: true,
  },
  {
    id: "adaptive-subagent",
    name: "Adaptive Subagent",
    type: "adaptive",
    status: "idle",
    capabilities: ["conversation", "adaptation", "analysis"],
    isActive: true,
  },
  {
    id: "workflow-agent",
    name: "Workflow Agent",
    type: "workflow",
    status: "idle",
    capabilities: ["workflow", "coordination", "data-query"],
    isActive: true,
  },
];

const initialAgentNetwork: AgentNetwork = {
  agents: initialAgents,
  activeAgents: initialAgents.filter(agent => agent.isActive).map(agent => agent.id),
  messages: [],
  spawnedAgents: [],
  recentTriggers: [],
};

interface AgentNetworkContextType {
  network: AgentNetwork;
  sendAgentMessage: (message: Omit<AgentMessage, "timestamp">) => void;
  createAgentTask: (task: Omit<AgentTask, "id" | "timestamp" | "status">) => AgentTask;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  getAgentById: (agentId: string) => Agent | undefined;
  getAgentsByCapability: (capability: AgentCapability) => Agent[];
  processCommand: (command: string) => Promise<any>;
  spawnAgent: (config: SpawnAgentConfig) => Promise<SpawnedAgent>;
  trainAgent: (agentId: string, examples: TrainingExample[]) => Promise<void>;
  exportAgent: (agentId: string) => Promise<AgentExport>;
  importAgent: (agentExport: AgentExport) => Promise<SpawnedAgent>;
  // MCP Workflow Processing
  processMcpWorkflow: (trigger: McpWorkflowTrigger) => Promise<McpWorkflowResult>;
  getWorkflowStatus: () => { activeWorkflows: number; completedWorkflows: number; failedWorkflows: number };
  addRecentTrigger: (trigger: McpWorkflowTrigger) => void;
}

const AgentNetworkContext = createContext<AgentNetworkContextType | undefined>(undefined);

export const AgentNetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<AgentNetwork>(initialAgentNetwork);
  const [workflowStats, setWorkflowStats] = useState({
    activeWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0
  });
  const [activeWorkflows, setActiveWorkflows] = useState<Map<string, McpWorkflowContext>>(new Map());

  useEffect(() => {
    // Log a test UUID to verify the library is working
    console.log("Testing UUID generation:", uuidv4());
  }, []);

  const sendAgentMessage = (message: Omit<AgentMessage, "timestamp">) => {
    const newMessage: AgentMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    setNetwork(prevNetwork => ({
      ...prevNetwork,
      messages: [...prevNetwork.messages, newMessage],
    }));

    // For now, just log the message to console
    console.log(`Agent message: ${message.from} -> ${message.to}: ${JSON.stringify(message.content)}`);
  };

  const createAgentTask = (task: Omit<AgentTask, "id" | "timestamp" | "status">): AgentTask => {
    const newTask: AgentTask = {
      ...task,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Update agent status
    updateAgentStatus(task.agentId, "processing");

    // Return the created task
    return newTask;
  };

  const updateAgentStatus = (agentId: string, status: AgentStatus) => {
    setNetwork(prevNetwork => ({
      ...prevNetwork,
      agents: prevNetwork.agents.map(agent => 
        agent.id === agentId ? { ...agent, status } : agent
      ),
    }));
  };

  const getAgentById = (agentId: string) => {
    return network.agents.find(agent => agent.id === agentId);
  };

  const getAgentsByCapability = (capability: AgentCapability) => {
    return network.agents.filter(agent => 
      agent.capabilities.includes(capability) && agent.isActive
    );
  };

  const processCommand = async (command: string) => {
    try {
      // First determine which agent should handle this command
      if (command.toLowerCase().includes("search") || command.toLowerCase().includes("find information")) {
        // This is a search command, delegate to research agent
        const researchAgents = getAgentsByCapability("search");

        if (researchAgents.length > 0) {
          const task = createAgentTask({
            agentId: researchAgents[0].id,
            type: "search",
            data: { query: command.replace(/search|find information about/i, "").trim() },
          });

          updateAgentStatus(researchAgents[0].id, "processing");

          try {
            // Use real LLM for research agent
            const messages = [
              createSystemMessage(AGENT_PROMPTS.research),
              createUserMessage(`Please research and provide information about: ${task.data.query}. Include relevant facts, context, and any important details.`)
            ];

            const llmResponse = await generateLLMResponse(messages);

            updateAgentStatus(researchAgents[0].id, "success");
            return {
              type: "search",
              result: llmResponse.content,
              agent: researchAgents[0].name,
              usage: llmResponse.usage
            };
          } catch (error) {
            updateAgentStatus(researchAgents[0].id, "error");
            throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } else if (command.toLowerCase().includes("workflow") || command.toLowerCase().includes("process")) {
        // This is a workflow command, delegate to workflow agent
        const workflowAgents = getAgentsByCapability("workflow");
        
        if (workflowAgents.length > 0) {
          const task = createAgentTask({
            agentId: workflowAgents[0].id,
            type: "workflow",
            data: { workflow: command },
          });
          
          updateAgentStatus(workflowAgents[0].id, "processing");

          try {
            // Use real LLM for workflow agent
            const messages = [
              createSystemMessage(AGENT_PROMPTS.workflow),
              createUserMessage(`Execute the McP workflow for this request: ${command}. Monitor the input, contextualize the requirements, and provide a personalized response.`)
            ];

            const llmResponse = await generateLLMResponse(messages);

            updateAgentStatus(workflowAgents[0].id, "success");
            return {
              type: "workflow",
              result: llmResponse.content,
              agent: workflowAgents[0].name,
              usage: llmResponse.usage
            };
          } catch (error) {
            updateAgentStatus(workflowAgents[0].id, "error");
            throw new Error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } else if (command.toLowerCase().includes("query") || command.toLowerCase().includes("data")) {
        // This is a data query, delegate to data agent
        const dataAgents = getAgentsByCapability("data-query");
        
        if (dataAgents.length > 0) {
          const task = createAgentTask({
            agentId: dataAgents[0].id,
            type: "data-query",
            data: { query: command },
          });
          
          updateAgentStatus(dataAgents[0].id, "processing");

          try {
            // Use real LLM for data agent
            const messages = [
              createSystemMessage(AGENT_PROMPTS.data),
              createUserMessage(`Process this data query: ${command}. Provide relevant data analysis, insights, or information based on the request.`)
            ];

            const llmResponse = await generateLLMResponse(messages);

            updateAgentStatus(dataAgents[0].id, "success");
            return {
              type: "data-query",
              result: llmResponse.content,
              agent: dataAgents[0].name,
              usage: llmResponse.usage
            };
          } catch (error) {
            updateAgentStatus(dataAgents[0].id, "error");
            throw new Error(`Data query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } else if (command.toLowerCase().includes("learn") || command.toLowerCase().includes("study")) {
      // This is a learning task, delegate to learning agent
      const learningAgents = getAgentsByCapability("learning");
      
      if (learningAgents.length > 0) {
        const task = createAgentTask({
          agentId: learningAgents[0].id,
          type: "learning",
          data: { topic: command.replace(/learn about|study/i, "").trim() },
        });
        
        // Simulate processing
        return new Promise(resolve => {
          setTimeout(() => {
            updateAgentStatus(learningAgents[0].id, "success");
            resolve({
              type: "learning",
              result: `Learning process completed on: ${task.data.topic}`,
              agent: learningAgents[0].name
            });
          }, 4000);
        });
      }
    } else {
      // Default to conversation with primary agent
      const primaryAgents = network.agents.filter(agent => agent.type === "primary" && agent.isActive);
      
      if (primaryAgents.length > 0) {
        const task = createAgentTask({
          agentId: primaryAgents[0].id,
          type: "conversation",
          data: { message: command },
        });
        
        updateAgentStatus(primaryAgents[0].id, "processing");

        try {
          // Use real LLM for primary agent
          const messages = [
            createSystemMessage(AGENT_PROMPTS.primary),
            createUserMessage(command)
          ];

          const llmResponse = await generateLLMResponse(messages);

          updateAgentStatus(primaryAgents[0].id, "success");
          return {
            type: "conversation",
            result: llmResponse.content,
            agent: primaryAgents[0].name,
            usage: llmResponse.usage
          };
        } catch (error) {
          updateAgentStatus(primaryAgents[0].id, "error");
          throw new Error(`Conversation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return Promise.resolve({ error: "No suitable agent found to handle this command" });
    } catch (error) {
      // Handle any errors that occur during command processing
      return Promise.resolve({
        type: "error",
        result: `Command processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        agent: "System"
      });
    }
  };

  // Agent spawning functionality
  const spawnAgent = async (config: SpawnAgentConfig): Promise<SpawnedAgent> => {
    const newSpawnedAgent: SpawnedAgent = {
      id: uuidv4(),
      name: config.name,
      baseAgentId: "adaptive-subagent",
      specialization: config.specialization,
      trainingData: config.initialTrainingData || [],
      capabilities: config.baseCapabilities,
      performance: {
        accuracy: 0,
        responseTime: 0,
        successRate: 0,
        totalInteractions: 0,
      },
      createdAt: new Date().toISOString(),
      lastTrained: new Date().toISOString(),
      isExported: false,
    };

    setNetwork(prevNetwork => ({
      ...prevNetwork,
      spawnedAgents: [...prevNetwork.spawnedAgents, newSpawnedAgent],
    }));

    return newSpawnedAgent;
  };

  const trainAgent = async (agentId: string, examples: TrainingExample[]): Promise<void> => {
    setNetwork(prevNetwork => ({
      ...prevNetwork,
      spawnedAgents: prevNetwork.spawnedAgents.map(agent =>
        agent.id === agentId
          ? {
              ...agent,
              trainingData: [...agent.trainingData, ...examples],
              lastTrained: new Date().toISOString(),
            }
          : agent
      ),
    }));
  };

  const exportAgent = async (agentId: string): Promise<AgentExport> => {
    const agent = network.spawnedAgents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentExport: AgentExport = {
      agent: { ...agent, isExported: true },
      trainingData: agent.trainingData,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        sourceSystem: "Adaptive Agent Nexus",
      },
    };

    // Mark as exported
    setNetwork(prevNetwork => ({
      ...prevNetwork,
      spawnedAgents: prevNetwork.spawnedAgents.map(a =>
        a.id === agentId ? { ...a, isExported: true } : a
      ),
    }));

    return agentExport;
  };

  const importAgent = async (agentExport: AgentExport): Promise<SpawnedAgent> => {
    const importedAgent: SpawnedAgent = {
      ...agentExport.agent,
      id: uuidv4(), // Generate new ID for imported agent
      isExported: false,
    };

    setNetwork(prevNetwork => ({
      ...prevNetwork,
      spawnedAgents: [...prevNetwork.spawnedAgents, importedAgent],
    }));

    return importedAgent;
  };

  // Add recent trigger to the network
  const addRecentTrigger = (trigger: McpWorkflowTrigger) => {
    setNetwork(prevNetwork => ({
      ...prevNetwork,
      recentTriggers: [trigger, ...prevNetwork.recentTriggers.slice(0, 9)] // Keep only the 10 most recent
    }));
  };

  // MCP Workflow Processing Functions
  const processMcpWorkflow = async (trigger: McpWorkflowTrigger): Promise<McpWorkflowResult> => {
    const startTime = Date.now();
    const workflowId = uuidv4();

    // Add trigger to recent triggers list
    addRecentTrigger(trigger);

    try {
      // Update workflow agent status
      updateAgentStatus("workflow-agent", "processing");
      setWorkflowStats(prev => ({ ...prev, activeWorkflows: prev.activeWorkflows + 1 }));

      // Phase 1: Monitor - Capture and validate the trigger
      const monitorResult = await processMonitorPhase(trigger);
      if (!monitorResult.success) {
        throw new Error(`Monitor phase failed: ${monitorResult.data}`);
      }

      // Phase 2: Contextualize - Enrich with user and system context
      const context: McpWorkflowContext = {
        trigger,
        userContext: await gatherUserContext(trigger),
        systemContext: await gatherSystemContext()
      };

      const contextualizeResult = await processContextualizePhase(context);
      if (!contextualizeResult.success) {
        throw new Error(`Contextualize phase failed: ${contextualizeResult.data}`);
      }

      // Phase 3: Personalize - Generate adaptive response
      const personalizeResult = await processPersonalizePhase(context, contextualizeResult.data);

      const processingTime = Date.now() - startTime;

      // Update workflow stats
      setWorkflowStats(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows - 1,
        completedWorkflows: personalizeResult.success ? prev.completedWorkflows + 1 : prev.completedWorkflows,
        failedWorkflows: personalizeResult.success ? prev.failedWorkflows : prev.failedWorkflows + 1
      }));

      // Update workflow agent status
      updateAgentStatus("workflow-agent", personalizeResult.success ? "success" : "error");

      return {
        ...personalizeResult,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      setWorkflowStats(prev => ({
        ...prev,
        activeWorkflows: prev.activeWorkflows - 1,
        failedWorkflows: prev.failedWorkflows + 1
      }));

      updateAgentStatus("workflow-agent", "error");

      return {
        phase: 'monitor',
        success: false,
        data: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0,
        processingTime
      };
    }
  };

  const processMonitorPhase = async (trigger: McpWorkflowTrigger): Promise<McpWorkflowResult> => {
    const startTime = Date.now();

    try {
      // Validate trigger data
      if (!trigger.data || typeof trigger.data !== 'object') {
        return {
          phase: 'monitor',
          success: false,
          data: 'Invalid trigger data',
          confidence: 0,
          processingTime: Date.now() - startTime
        };
      }

      // Log trigger capture
      sendAgentMessage({
        from: 'workflow-agent',
        to: 'primary-agent',
        content: {
          type: 'workflow_monitor',
          data: `Captured ${trigger.type} trigger from ${trigger.source}`,
          triggerId: trigger.id
        }
      });

      // Simulate data validation and initial processing
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        phase: 'monitor',
        success: true,
        data: { validatedTrigger: trigger, captured: true },
        confidence: 0.95,
        processingTime: Date.now() - startTime,
        nextPhase: 'contextualize'
      };

    } catch (error) {
      return {
        phase: 'monitor',
        success: false,
        data: error instanceof Error ? error.message : 'Monitor phase error',
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  };

  const gatherUserContext = async (trigger: McpWorkflowTrigger) => {
    // Gather user preferences, history, and profile data
    const recentMessages = network.messages
      .filter(msg => msg.from === 'user' || msg.to === 'user')
      .slice(-10); // Last 10 user-related messages

    return {
      preferences: {
        responseStyle: 'adaptive',
        detailLevel: 'balanced',
        language: 'en'
      },
      history: recentMessages,
      profile: {
        interactionCount: recentMessages.length,
        lastActivity: recentMessages[0]?.timestamp || new Date().toISOString()
      }
    };
  };

  const gatherSystemContext = async () => {
    return {
      activeAgents: network.activeAgents,
      systemMetrics: {
        totalAgents: network.agents.length,
        activeAgents: network.agents.filter(a => a.status === 'processing').length,
        totalMessages: network.messages.length,
        spawnedAgents: network.spawnedAgents?.length || 0
      },
      availableResources: ['llm-service', 'vector-db', 'file-storage', 'web-search']
    };
  };

  const processContextualizePhase = async (context: McpWorkflowContext): Promise<McpWorkflowResult> => {
    const startTime = Date.now();

    try {
      // Enrich context with vector search and database queries
      const enrichedData = {
        semanticSearch: await performSemanticSearch(context.trigger.data),
        userPatterns: analyzeUserPatterns(context.userContext?.history || []),
        systemCapabilities: context.systemContext?.availableResources || [],
        contextualRelevance: calculateRelevance(context.trigger, context.userContext)
      };

      // Log contextualization
      sendAgentMessage({
        from: 'workflow-agent',
        to: 'primary-agent',
        content: {
          type: 'workflow_contextualize',
          data: `Enriched context with ${enrichedData.semanticSearch.length} relevant items`,
          triggerId: context.trigger.id
        }
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        phase: 'contextualize',
        success: true,
        data: enrichedData,
        confidence: 0.88,
        processingTime: Date.now() - startTime,
        nextPhase: 'personalize'
      };

    } catch (error) {
      return {
        phase: 'contextualize',
        success: false,
        data: error instanceof Error ? error.message : 'Contextualize phase error',
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  };

  const performSemanticSearch = async (queryData: any): Promise<any[]> => {
    // Simulate semantic search against vector database
    const mockResults = [
      { content: 'Previous similar interaction', relevance: 0.92 },
      { content: 'Related knowledge base entry', relevance: 0.87 },
      { content: 'User preference pattern', relevance: 0.78 }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    return mockResults;
  };

  const analyzeUserPatterns = (history: AgentMessage[]): any => {
    // Analyze user interaction patterns
    const messageCount = history.length;
    const avgResponseTime = messageCount > 1 ? 2.3 : 0; // Mock calculation

    return {
      interactionFrequency: messageCount,
      preferredTopics: ['ai', 'automation', 'workflow'],
      responsePatterns: {
        avgResponseTime,
        preferredDetailLevel: 'balanced'
      }
    };
  };

  const calculateRelevance = (trigger: McpWorkflowTrigger, userContext?: any): number => {
    // Calculate contextual relevance score
    let relevance = 0.5; // Base relevance

    if (userContext?.history?.length > 0) {
      relevance += 0.2; // User has history
    }

    if (trigger.priority === 'high' || trigger.priority === 'critical') {
      relevance += 0.2; // High priority trigger
    }

    return Math.min(relevance, 1.0);
  };

  const processPersonalizePhase = async (context: McpWorkflowContext, enrichedData: any): Promise<McpWorkflowResult> => {
    const startTime = Date.now();

    try {
      // Generate personalized response using LLM
      const personalizedResponse = await generatePersonalizedResponse(context, enrichedData);

      // Log personalization
      sendAgentMessage({
        from: 'workflow-agent',
        to: 'primary-agent',
        content: {
          type: 'workflow_personalize',
          data: `Generated personalized response with ${personalizedResponse.confidence * 100}% confidence`,
          triggerId: context.trigger.id
        }
      });

      // Send final response to user
      sendAgentMessage({
        from: 'workflow-agent',
        to: 'user',
        content: {
          type: 'direct_message',
          message: personalizedResponse.content
        }
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 250));

      return {
        phase: 'personalize',
        success: true,
        data: personalizedResponse,
        confidence: personalizedResponse.confidence,
        processingTime: Date.now() - startTime,
        nextPhase: 'complete'
      };

    } catch (error) {
      return {
        phase: 'personalize',
        success: false,
        data: error instanceof Error ? error.message : 'Personalize phase error',
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  };

  const generatePersonalizedResponse = async (context: McpWorkflowContext, enrichedData: any) => {
    // Generate personalized response based on context and enriched data
    const userPreferences = context.userContext?.preferences || {};
    const semanticResults = enrichedData.semanticSearch || [];
    const userPatterns = enrichedData.userPatterns || {};

    // Craft personalized response
    let response = '';

    if (context.trigger.type === 'user_input') {
      response = `Based on your interaction patterns and the context I've gathered, here's a personalized response to: "${context.trigger.data}"\n\n`;
      response += `I found ${semanticResults.length} relevant pieces of information that might help. `;
      response += `Considering your preference for ${userPreferences.detailLevel || 'balanced'} detail level, `;
      response += `I'll provide a ${userPatterns.responsePatterns?.preferredDetailLevel || 'comprehensive'} response.`;
    } else {
      response = `I've processed the ${context.trigger.type} trigger and generated a contextual response using the available system resources.`;
    }

    return {
      content: response,
      confidence: 0.91,
      personalizationFactors: {
        userHistory: userPatterns.interactionFrequency,
        semanticMatches: semanticResults.length,
        systemContext: context.systemContext?.activeAgents?.length || 0
      }
    };
  };

  const getWorkflowStatus = () => {
    return workflowStats;
  };

  const contextValue = {
    network,
    sendAgentMessage,
    createAgentTask,
    updateAgentStatus,
    getAgentById,
    getAgentsByCapability,
    processCommand,
    spawnAgent,
    trainAgent,
    exportAgent,
    importAgent,
    // MCP Workflow Processing
    processMcpWorkflow,
    getWorkflowStatus,
    addRecentTrigger,
  };

  return (
    <AgentNetworkContext.Provider value={contextValue}>
      {children}
    </AgentNetworkContext.Provider>
  );
};

export const useAgentNetwork = () => {
  const context = useContext(AgentNetworkContext);
  if (context === undefined) {
    throw new Error("useAgentNetwork must be used within an AgentNetworkProvider");
  }
  return context;
};
