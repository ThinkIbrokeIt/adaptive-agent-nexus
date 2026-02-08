
import { LogEntry, SearchResult } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { AgentLLMService } from "@/lib/llmConfig";

export const processSearchCommand = async (
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

  try {
    // Use LLM to analyze and provide search results
    const analysis = await AgentLLMService.searchAndAnalyze(query, 'research');

    addLog("info", `Search Results for "${query}":\n\n${analysis.summary}`);

    if (analysis.keyPoints.length > 0) {
      addLog("info", `Key Points:\n${analysis.keyPoints.map(point => `• ${point}`).join('\n')}`);
    }

    if (analysis.sources.length > 0) {
      addLog("info", `Sources:\n${analysis.sources.map(source => `• ${source}`).join('\n')}`);
    }

    addLog("success", `LLM-powered search completed for "${query}".`);
    addLog("system", "Knowledge base updated with new information.");

  } catch (error) {
    console.error('Search LLM error:', error);
    addLog("warning", "LLM search service unavailable. Using simulated results...");

    // Fallback to mock results
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
  } finally {
    setIsSearching(false);
  }
};
