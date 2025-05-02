
import { LogEntry, SearchResult } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";

export const processSearchCommand = (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  setIsSearching: (isSearching: boolean) => void,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
  const query = commandText.toLowerCase().replace("search", "").trim();
  
  if (!query) {
    addLog("error", "Please provide a search query. Example: search artificial intelligence");
    return;
  }
  
  addLog("system", `Searching for "${query}"...`);
  setIsSearching(true);
  
  // Delegate to the research agent if available
  const researchAgents = agentNetwork.getAgentsByCapability("search");
  
  if (researchAgents.length > 0) {
    addLog("system", `Delegating search to ${researchAgents[0].name}...`);
    
    agentNetwork.sendAgentMessage({
      from: "primary-agent",
      to: researchAgents[0].id,
      content: { query },
      type: "request"
    });
  }
  
  // Simulate search operation
  setTimeout(() => {
    const mockResults: SearchResult[] = [
      {
        title: `Research Paper: Advances in ${query}`,
        snippet: `Recent developments in ${query} show promising results for adaptive learning systems and contextual awareness.`,
        url: `https://research.example.com/${query.replace(/\s+/g, '-')}`
      },
      {
        title: `Understanding ${query} in Modern Systems`,
        snippet: `${query} has revolutionized how we approach data processing and contextual learning in AI frameworks.`,
        url: `https://academy.example.com/topics/${query.replace(/\s+/g, '-')}`
      },
      {
        title: `${query} Implementation Guide`,
        snippet: `Step-by-step instructions for implementing ${query} in your McP workflow architecture.`,
        url: `https://docs.example.com/guides/${query.replace(/\s+/g, '-')}`
      }
    ];
    
    addLog("search", JSON.stringify(mockResults));
    
    setTimeout(() => {
      addLog("success", `Search completed. Found ${mockResults.length} relevant results for "${query}".`);
      addLog("system", "Knowledge base updated with new information.");
      setIsSearching(false);
    }, 500);
  }, 2000);
};
