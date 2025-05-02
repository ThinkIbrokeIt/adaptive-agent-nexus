
import { LogEntry } from "@/types/agent";
import { processSearchCommand } from "./searchCommands";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";

export const processTellMeAboutCommand = (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  setIsSearching: (isSearching: boolean) => void,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
  const topic = commandText.toLowerCase().replace("tell me about", "").trim();
  
  if (topic.length > 0) {
    const researchAgents = agentNetwork.getAgentsByCapability("search");
    
    if (researchAgents.length > 0) {
      addLog("system", `Delegating research on "${topic}" to ${researchAgents[0].name}...`);
      
      agentNetwork.sendAgentMessage({
        from: "primary-agent",
        to: researchAgents[0].id,
        content: { topic },
        type: "request"
      });
      
      // Then continue with the existing search logic
      setTimeout(() => {
        processSearchCommand(`search ${topic}`, addLog, setIsSearching, agentNetwork);
      }, 1000);
      return;
    }
  }
  
  setTimeout(() => {
    addLog("system", `Retrieving information about "${topic}"...`);
    
    if (topic.length > 0) {
      // Check if we need to search for more information
      const knownTopics = ["mcp", "workflows", "feedback loops", "adaptive learning"];
      const isKnown = knownTopics.some(t => topic.includes(t));
      
      if (!isKnown) {
        addLog("system", `Limited information found. Initiating search for "${topic}"...`);
        setTimeout(() => {
          processSearchCommand(`search ${topic}`, addLog, setIsSearching, agentNetwork);
        }, 1000);
        return;
      }
    }
    
    setTimeout(() => {
      addLog("info", `${topic} is part of the agent's knowledge base. It relates to adaptive learning systems that continuously evolve through feedback loops and context-aware interactions.`);
    }, 1500);
  }, 2000);
};

export const processConversationalQuery = (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  setIsSearching: (isSearching: boolean) => void,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
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
        processSearchCommand(`search ${searchQuery}`, addLog, setIsSearching, agentNetwork);
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
