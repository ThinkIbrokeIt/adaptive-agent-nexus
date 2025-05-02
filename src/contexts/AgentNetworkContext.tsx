
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AgentNetwork, Agent, AgentMessage, AgentTask, AgentStatus, AgentCapability } from "@/types/agent";
import { v4 as uuidv4 } from "uuid";

// Initial set of agents
const initialAgents: Agent[] = [
  {
    id: "primary-agent",
    name: "Primary Agent",
    type: "primary",
    status: "idle",
    capabilities: ["conversation", "workflow"],
    isActive: true,
  },
  {
    id: "research-agent",
    name: "Research Agent",
    type: "research",
    status: "idle",
    capabilities: ["search"],
    isActive: true,
  },
  {
    id: "workflow-agent",
    name: "Workflow Agent",
    type: "workflow",
    status: "idle",
    capabilities: ["workflow"],
    isActive: true,
  },
  {
    id: "data-agent",
    name: "Data Agent",
    type: "data",
    status: "idle",
    capabilities: ["data-query"],
    isActive: true,
  },
  {
    id: "learning-agent",
    name: "Learning Agent",
    type: "learning",
    status: "idle",
    capabilities: ["learning"],
    isActive: true,
  },
];

const initialAgentNetwork: AgentNetwork = {
  agents: initialAgents,
  activeAgents: initialAgents.filter(agent => agent.isActive).map(agent => agent.id),
  messages: [],
};

interface AgentNetworkContextType {
  network: AgentNetwork;
  sendAgentMessage: (message: Omit<AgentMessage, "timestamp">) => void;
  createAgentTask: (task: Omit<AgentTask, "id" | "timestamp" | "status">) => AgentTask;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  getAgentById: (agentId: string) => Agent | undefined;
  getAgentsByCapability: (capability: AgentCapability) => Agent[];
  processCommand: (command: string) => Promise<any>;
}

const AgentNetworkContext = createContext<AgentNetworkContextType | undefined>(undefined);

export const AgentNetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetwork] = useState<AgentNetwork>(initialAgentNetwork);

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
        
        // Simulate processing
        return new Promise(resolve => {
          setTimeout(() => {
            updateAgentStatus(researchAgents[0].id, "success");
            resolve({
              type: "search",
              result: `Research completed on: ${task.data.query}`,
              agent: researchAgents[0].name
            });
          }, 2000);
        });
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
        
        // Simulate processing
        return new Promise(resolve => {
          setTimeout(() => {
            updateAgentStatus(workflowAgents[0].id, "success");
            resolve({
              type: "workflow",
              result: "Workflow executed successfully",
              agent: workflowAgents[0].name
            });
          }, 3000);
        });
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
        
        // Simulate processing
        return new Promise(resolve => {
          setTimeout(() => {
            updateAgentStatus(dataAgents[0].id, "success");
            resolve({
              type: "data-query",
              result: "Data query processed",
              agent: dataAgents[0].name
            });
          }, 1500);
        });
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
        
        // Simulate processing
        return new Promise(resolve => {
          setTimeout(() => {
            updateAgentStatus(primaryAgents[0].id, "success");
            resolve({
              type: "conversation",
              result: `Processed: ${command}`,
              agent: primaryAgents[0].name
            });
          }, 1000);
        });
      }
    }

    return Promise.resolve({ error: "No suitable agent found to handle this command" });
  };

  const contextValue = {
    network,
    sendAgentMessage,
    createAgentTask,
    updateAgentStatus,
    getAgentById,
    getAgentsByCapability,
    processCommand,
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
