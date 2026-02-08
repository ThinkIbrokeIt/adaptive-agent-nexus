import { useAgentNetwork } from "@/contexts/AgentNetworkContext";

export const useKnowledgeGraphDemo = () => {
  const { network, sendAgentMessage, updateAgentStatus } = useAgentNetwork();

  const simulateAgentInteraction = () => {
    // Simulate a workflow starting
    updateAgentStatus("workflow-agent", "processing");

    // Simulate message passing
    sendAgentMessage({
      from: "primary-agent",
      to: "workflow-agent",
      content: {
        type: "workflow_request",
        data: "Process user query through McP workflow"
      }
    });

    // Simulate workflow completion
    setTimeout(() => {
      updateAgentStatus("workflow-agent", "success");
      sendAgentMessage({
        from: "workflow-agent",
        to: "primary-agent",
        content: {
          type: "workflow_complete",
          data: "McP workflow completed successfully"
        }
      });
    }, 2000);
  };

  const simulateSearchTask = () => {
    updateAgentStatus("research-agent", "processing");

    sendAgentMessage({
      from: "primary-agent",
      to: "research-agent",
      content: {
        type: "search_request",
        data: "Search for information about AI agents"
      }
    });

    setTimeout(() => {
      updateAgentStatus("research-agent", "success");
    }, 3000);
  };

  const resetAllAgents = () => {
    network.agents.forEach(agent => {
      updateAgentStatus(agent.id, "idle");
    });
  };

  return {
    simulateAgentInteraction,
    simulateSearchTask,
    resetAllAgents,
    activeAgents: network.agents.filter(a => a.status === 'processing').length,
    totalMessages: network.messages.length
  };
};