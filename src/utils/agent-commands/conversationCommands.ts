
import { LogEntry } from "@/types/agent";
import { processSearchCommand } from "./searchCommands";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { AgentLLMService } from "@/lib/llmConfig";

export const processTellMeAboutCommand = async (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  setIsSearching: (isSearching: boolean) => void,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
  const topic = commandText.toLowerCase().replace("tell me about", "").trim();

  if (topic.length > 0) {
    addLog("system", `Retrieving information about "${topic}"...`);

    try {
      // Try to get information from LLM
      const response = await AgentLLMService.generateAgentResponse(
        'research',
        `Provide a comprehensive explanation of ${topic}. Include key concepts, applications, and relevant context.`,
        'You are an expert knowledge assistant providing accurate, helpful information.'
      );

      addLog("info", response);
    } catch (error) {
      console.error('LLM error:', error);
      addLog("warning", `LLM service unavailable. Searching for "${topic}" instead...`);

      // Fallback to search
      setTimeout(() => {
        processSearchCommand(`search ${topic}`, addLog, setIsSearching, agentNetwork);
      }, 1000);
    }
  } else {
    addLog("error", "Please specify a topic. Example: tell me about artificial intelligence");
  }
};

export const processConversationalQuery = async (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  setIsSearching: (isSearching: boolean) => void,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
  addLog("system", "Processing conversational query...");

  try {
    // Use LLM to generate a contextual response
    const context = "You are an adaptive AI agent using the McP (Monitor-Contextualize-Personalize) framework. Provide helpful, contextual responses while maintaining awareness of your agent capabilities and the McP workflow.";

    const response = await AgentLLMService.generateAgentResponse(
      'primary',
      commandText,
      context
    );

    addLog("info", response);
  } catch (error) {
    console.error('LLM error:', error);
    addLog("warning", "LLM service unavailable. Using fallback response mode.");

    // Fallback to basic response
    setTimeout(() => {
      addLog("info", `Response to "${commandText}": I'm designed to assist with McP workflow operations and knowledge retrieval. My capabilities include monitoring user interactions, contextualizing data, personalizing responses, and learning through feedback loops.`);
    }, 1500);
  }
};
