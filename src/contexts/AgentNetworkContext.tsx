
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
    id: "console-agent",
    name: "Console Agent",
    type: "adaptive",
    status: "idle",
    capabilities: ["conversation", "guidance", "system-knowledge"],
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
  spawnedAgents: [
    {
      id: "console-agent",
      name: "Console Agent",
      baseAgentId: "primary-agent",
      specialization: "system guidance and feature explanation",
      trainingData: [
        {
          input: "What can you help me with?",
          expectedOutput: "I can help you with all features of the Adaptive Agent Nexus system! I know about: 1) Agent Console commands (help, status, clear, search, workflow), 2) Multi-agent architecture (5 specialized agents), 3) Voice interface (speech recognition & synthesis), 4) McP Workflow System (Monitor→Contextualize→Personalize), 5) Dashboard tabs (Dashboard, n8n Workflows, Storage, Knowledge Graph, Agent Console, LLM Settings, Local Training, System Tests), 6) Agent spawning and training, 7) Real-time monitoring and performance metrics. What would you like to explore?",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "I can help you with all features of the Adaptive Agent Nexus system! I know about: 1) Agent Console commands (help, status, clear, search, workflow), 2) Multi-agent architecture (5 specialized agents), 3) Voice interface (speech recognition & synthesis), 4) McP Workflow System (Monitor→Contextualize→Personalize), 5) Dashboard tabs (Dashboard, n8n Workflows, Storage, Knowledge Graph, Agent Console, LLM Settings, Local Training, System Tests), 6) Agent spawning and training, 7) Real-time monitoring and performance metrics. What would you like to explore?"
        },
        {
          input: "How do I use the agent console?",
          expectedOutput: "The Agent Console has three main sections: 1) Console tab - for text commands and logs, 2) Direct Chat tab - for chatting with individual agents, 3) Agent Status tab - for monitoring agent health. Available commands: 'help' (show all commands), 'status' (system info), 'clear' (clear logs), 'search [query]' (web search), 'workflow run' (execute McP workflow). You can also spawn new specialized agents using the 'Spawn' button.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "The Agent Console has three main sections: 1) Console tab - for text commands and logs, 2) Direct Chat tab - for chatting with individual agents, 3) Agent Status tab - for monitoring agent health. Available commands: 'help' (show all commands), 'status' (system info), 'clear' (clear logs), 'search [query]' (web search), 'workflow run' (execute McP workflow). You can also spawn new specialized agents using the 'Spawn' button."
        },
        {
          input: "What are the dashboard tabs?",
          expectedOutput: "The dashboard has 8 main tabs: 1) Dashboard - system overview, trigger cards, recent activity, 2) n8n Workflows - manage and execute automation workflows, 3) Storage - data management and configuration, 4) Knowledge Graph - visual agent relationships and data flow, 5) Agent Console - command interface and agent management, 6) LLM Settings - language model configuration, 7) Local Training - model training and fine-tuning, 8) System Tests - automated feature verification. Each tab serves a specific purpose in managing the multi-agent system.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "The dashboard has 8 main tabs: 1) Dashboard - system overview, trigger cards, recent activity, 2) n8n Workflows - manage and execute automation workflows, 3) Storage - data management and configuration, 4) Knowledge Graph - visual agent relationships and data flow, 5) Agent Console - command interface and agent management, 6) LLM Settings - language model configuration, 7) Local Training - model training and fine-tuning, 8) System Tests - automated feature verification. Each tab serves a specific purpose in managing the multi-agent system."
        },
        {
          input: "How does the McP workflow system work?",
          expectedOutput: "McP stands for Monitor→Contextualize→Personalize. It's our 3-phase workflow system: 1) Monitor - captures and validates input triggers (user actions, system events, data changes), 2) Contextualize - enriches data with semantic search and user context, 3) Personalize - generates tailored responses using LLM. Workflows run automatically and you can see real-time progress in the Dashboard tab. The system continuously learns from feedback to improve responses.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "McP stands for Monitor→Contextualize→Personalize. It's our 3-phase workflow system: 1) Monitor - captures and validates input triggers (user actions, system events, data changes), 2) Contextualize - enriches data with semantic search and user context, 3) Personalize - generates tailored responses using LLM. Workflows run automatically and you can see real-time progress in the Dashboard tab. The system continuously learns from feedback to improve responses."
        },
        {
          input: "Tell me about the multi-agent architecture",
          expectedOutput: "We have 5 specialized agents working together: 1) Primary Agent - main coordinator and conversational interface, 2) Research Agent - web searches and information gathering, 3) Workflow Agent - McP workflow execution and automation, 4) Data Agent - database queries and data analysis, 5) Learning Agent - continuous improvement and knowledge acquisition. Agents communicate via message passing and tasks are automatically delegated based on capabilities. You can spawn additional specialized agents for specific tasks.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "We have 5 specialized agents working together: 1) Primary Agent - main coordinator and conversational interface, 2) Research Agent - web searches and information gathering, 3) Workflow Agent - McP workflow execution and automation, 4) Data Agent - database queries and data analysis, 5) Learning Agent - continuous improvement and knowledge acquisition. Agents communicate via message passing and tasks are automatically delegated based on capabilities. You can spawn additional specialized agents for specific tasks."
        },
        {
          input: "How do I spawn a new agent?",
          expectedOutput: "To spawn a new agent: 1) Go to Agent Console → Direct Chat tab, 2) Click the 'Spawn' button next to 'Select Agent', 3) Fill in: Agent Name (e.g., 'Code Review Agent'), Specialization (e.g., 'code analysis'), Capabilities (comma-separated like 'analysis,communication'), and optional Initial Training Data, 4) Click spawn. The new agent will appear in the spawned agents list with an export button. You can then chat with it directly or use it in workflows.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "To spawn a new agent: 1) Go to Agent Console → Direct Chat tab, 2) Click the 'Spawn' button next to 'Select Agent', 3) Fill in: Agent Name (e.g., 'Code Review Agent'), Specialization (e.g., 'code analysis'), Capabilities (comma-separated like 'analysis,communication'), and optional Initial Training Data, 4) Click spawn. The new agent will appear in the spawned agents list with an export button. You can then chat with it directly or use it in workflows."
        },
        {
          input: "What is the voice interface?",
          expectedOutput: "The voice interface provides speech recognition and text-to-speech: 1) Speech Recognition - click the microphone icon in the command input to speak commands instead of typing, 2) Text-to-Speech - the system can read responses aloud (toggle with voice controls), 3) Voice Commands - you can say 'help', 'status', 'search for [topic]', 'run workflow', etc. The system works with modern browsers and provides visual feedback during speech recognition.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "The voice interface provides speech recognition and text-to-speech: 1) Speech Recognition - click the microphone icon in the command input to speak commands instead of typing, 2) Text-to-Speech - the system can read responses aloud (toggle with voice controls), 3) Voice Commands - you can say 'help', 'status', 'search for [topic]', 'run workflow', etc. The system works with modern browsers and provides visual feedback during speech recognition."
        },
        {
          input: "How do I export trained agents?",
          expectedOutput: "To export a trained agent: 1) Go to Agent Console → Direct Chat tab, 2) Find the agent in the 'Spawned Agents' section, 3) Click the download icon (⬇️) next to the agent name, 4) The agent will be saved as a JSON file containing all training data, performance metrics, and metadata. You can later import this agent into other systems or share it with others. The filename includes the agent name and export date.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "To export a trained agent: 1) Go to Agent Console → Direct Chat tab, 2) Find the agent in the 'Spawned Agents' section, 3) Click the download icon (⬇️) next to the agent name, 4) The agent will be saved as a JSON file containing all training data, performance metrics, and metadata. You can later import this agent into other systems or share it with others. The filename includes the agent name and export date."
        },
        {
          input: "What is the Knowledge Graph?",
          expectedOutput: "The Knowledge Graph is an interactive visualization showing: 1) Agent relationships and communication patterns, 2) Data flow between system components, 3) Real-time status updates (drag nodes, click for details), 4) Export options (JSON, SVG, CSV, PNG formats), 5) Filtering and search capabilities. It helps you understand how agents work together and monitor system activity. You can export the graph data for analysis or documentation.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "The Knowledge Graph is an interactive visualization showing: 1) Agent relationships and communication patterns, 2) Data flow between system components, 3) Real-time status updates (drag nodes, click for details), 4) Export options (JSON, SVG, CSV, PNG formats), 5) Filtering and search capabilities. It helps you understand how agents work together and monitor system activity. You can export the graph data for analysis or documentation."
        },
        {
          input: "How do I configure storage?",
          expectedOutput: "Storage configuration is in the Storage tab: 1) Choose provider (DuckDB, ChromaDB, SQLite, MinIO), 2) Configure connection settings (host, port, credentials), 3) Set up data schemas and indexes, 4) Test connections with the 'Test Connection' button, 5) Save configuration. The system supports multiple storage backends for different data types - vector databases for embeddings, relational databases for structured data, and object storage for files.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Storage configuration is in the Storage tab: 1) Choose provider (DuckDB, ChromaDB, SQLite, MinIO), 2) Configure connection settings (host, port, credentials), 3) Set up data schemas and indexes, 4) Test connections with the 'Test Connection' button, 5) Save configuration. The system supports multiple storage backends for different data types - vector databases for embeddings, relational databases for structured data, and object storage for files."
        },
        {
          input: "What are system tests?",
          expectedOutput: "System Tests provide automated feature verification: 1) Run comprehensive tests to ensure all features work, 2) Check agent communication and task delegation, 3) Verify workflow execution and data processing, 4) Monitor performance metrics and system health, 5) Generate detailed test reports. Tests run automatically and help maintain system reliability. You can see test results in real-time and get notifications about any issues.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "System Tests provide automated feature verification: 1) Run comprehensive tests to ensure all features work, 2) Check agent communication and task delegation, 3) Verify workflow execution and data processing, 4) Monitor performance metrics and system health, 5) Generate detailed test reports. Tests run automatically and help maintain system reliability. You can see test results in real-time and get notifications about any issues."
        },
        {
          input: "How do I configure the LLM?",
          expectedOutput: "LLM configuration is in the LLM Settings tab: 1) Select provider (OpenAI, Anthropic, local models), 2) Enter API keys and endpoints, 3) Configure model parameters (temperature, max tokens, etc.), 4) Set up model routing and fallbacks, 5) Test the configuration. The system supports multiple LLM providers and can route requests based on task complexity. Local models can be configured for privacy or offline use.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "LLM configuration is in the LLM Settings tab: 1) Select provider (OpenAI, Anthropic, local models), 2) Enter API keys and endpoints, 3) Configure model parameters (temperature, max tokens, etc.), 4) Set up model routing and fallbacks, 5) Test the configuration. The system supports multiple LLM providers and can route requests based on task complexity. Local models can be configured for privacy or offline use."
        },
        {
          input: "What is local training?",
          expectedOutput: "Local Training allows you to fine-tune models: 1) Upload training datasets (JSONL, CSV, text formats), 2) Configure training parameters (epochs, batch size, learning rate), 3) Monitor training progress in real-time, 4) Evaluate model performance, 5) Deploy trained models. You can create specialized agents by training on domain-specific data. The system supports incremental training and model versioning.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Local Training allows you to fine-tune models: 1) Upload training datasets (JSONL, CSV, text formats), 2) Configure training parameters (epochs, batch size, learning rate), 3) Monitor training progress in real-time, 4) Evaluate model performance, 5) Deploy trained models. You can create specialized agents by training on domain-specific data. The system supports incremental training and model versioning."
        },
        {
          input: "How do I run a workflow?",
          expectedOutput: "To run a workflow: 1) Go to Dashboard tab and click 'Run MCP Workflow' button, 2) Or use the command 'workflow run' in Agent Console, 3) Watch the 3-phase progress (Monitor→Contextualize→Personalize), 4) See real-time updates in trigger cards, 5) View results in Recent Triggers. Workflows process user inputs, system events, or data changes automatically. You can also manage n8n workflows in the n8n Workflows tab for more complex automation.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "To run a workflow: 1) Go to Dashboard tab and click 'Run MCP Workflow' button, 2) Or use the command 'workflow run' in Agent Console, 3) Watch the 3-phase progress (Monitor→Contextualize→Personalize), 4) See real-time updates in trigger cards, 5) View results in Recent Triggers. Workflows process user inputs, system events, or data changes automatically. You can also manage n8n workflows in the n8n Workflows tab for more complex automation."
        },
        {
          input: "What commands are available?",
          expectedOutput: "Available commands: 'help' (show commands), 'status' (system info), 'clear' (clear logs), 'search [query]' (web search), 'workflow run' (execute McP workflow), 'tell me about [topic]' (conversational queries), 'feedback [message]' (provide feedback), 'voice on/off' (toggle voice), 'query [question]' (ask questions). Commands are processed by the appropriate specialized agent automatically.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Available commands: 'help' (show commands), 'status' (system info), 'clear' (clear logs), 'search [query]' (web search), 'workflow run' (execute McP workflow), 'tell me about [topic]' (conversational queries), 'feedback [message]' (provide feedback), 'voice on/off' (toggle voice), 'query [question]' (ask questions). Commands are processed by the appropriate specialized agent automatically."
        },
        {
          input: "How do I get started?",
          expectedOutput: "Welcome to Adaptive Agent Nexus! Here's how to get started: 1) Explore the Dashboard tab to see system overview, 2) Try the 'help' command in Agent Console to see available commands, 3) Click 'Run MCP Workflow' to see the 3-phase system in action, 4) Visit Knowledge Graph to understand agent relationships, 5) Try spawning a new agent in Agent Console → Direct Chat, 6) Use voice commands by clicking the microphone icon. The system is fully functional out of the box with comprehensive training!",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Welcome to Adaptive Agent Nexus! Here's how to get started: 1) Explore the Dashboard tab to see system overview, 2) Try the 'help' command in Agent Console to see available commands, 3) Click 'Run MCP Workflow' to see the 3-phase system in action, 4) Visit Knowledge Graph to understand agent relationships, 5) Try spawning a new agent in Agent Console → Direct Chat, 6) Use voice commands by clicking the microphone icon. The system is fully functional out of the box with comprehensive training!"
        }
      ],
      capabilities: ["conversation", "coordination", "guidance", "system-knowledge"],
      performance: {
        accuracy: 0.95,
        responseTime: 800,
        successRate: 0.98,
        totalInteractions: 150,
      },
      createdAt: "2024-01-01T00:00:00Z",
      lastTrained: new Date().toISOString(),
      isExported: false,
    },
    {
      id: "test-agent-1",
      name: "Test Research Agent",
      baseAgentId: "adaptive-subagent",
      specialization: "research and analysis",
      trainingData: [
        {
          input: "What is machine learning?",
          expectedOutput: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed."
        },
        {
          input: "Explain neural networks",
          expectedOutput: "Neural networks are computing systems inspired by biological neural networks that can learn to perform tasks by considering examples.",
          feedback: "positive",
          timestamp: new Date().toISOString(),
          actualOutput: "Neural networks are computing systems inspired by biological neural networks that can learn to perform tasks by considering examples."
        }
      ],
      capabilities: ["research", "analysis", "communication"],
      performance: {
        accuracy: 0.85,
        responseTime: 1200,
        successRate: 0.92,
        totalInteractions: 25,
      },
      createdAt: "2024-01-15T10:30:00Z",
      lastTrained: "2024-01-20T14:45:00Z",
      isExported: false,
    }
  ],
  recentTriggers: [],
};

interface AgentNetworkContextType {
  network: AgentNetwork;
  processingStage: string | null;
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
  const [processingStage, setProcessingStage] = useState<string | null>(null);
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
      console.log('Setting processingStage to monitor');
      setProcessingStage("monitor");

      // Phase 1: Monitor - Capture and validate the trigger
      const monitorResult = await processMonitorPhase(trigger);
      if (!monitorResult.success) {
        throw new Error(`Monitor phase failed: ${monitorResult.data}`);
      }

      setProcessingStage("contextualize");
      console.log('AgentNetworkContext: setProcessingStage to contextualize');
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

      console.log('AgentNetworkContext: setProcessingStage to personalize');
      setProcessingStage("personalize");

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
      setProcessingStage(null);
      console.log('AgentNetworkContext: setProcessingStage to null (success)');

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

      console.log('AgentNetworkContext: setProcessingStage to null (error)');
      updateAgentStatus("workflow-agent", "error");
      setProcessingStage(null);

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
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      await new Promise(resolve => setTimeout(resolve, 1500));

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
      await new Promise(resolve => setTimeout(resolve, 1200));

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
    processingStage,
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
