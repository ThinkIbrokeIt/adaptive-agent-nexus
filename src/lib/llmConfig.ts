import { LLMConfig, initializeLLM, generateLLMResponse, createSystemMessage, createUserMessage, AGENT_PROMPTS } from "@/lib/llm";

// LLM Configuration Management
class LLMConfigManager {
  private static instance: LLMConfigManager;
  private config: LLMConfig | null = null;

  private constructor() {}

  static getInstance(): LLMConfigManager {
    if (!LLMConfigManager.instance) {
      LLMConfigManager.instance = new LLMConfigManager();
    }
    return LLMConfigManager.instance;
  }

  // Load configuration from localStorage
  loadConfig(): LLMConfig | null {
    try {
      const stored = localStorage.getItem('adaptive-agent-llm-config');
      if (stored) {
        this.config = JSON.parse(stored);
        initializeLLM(this.config);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading LLM config:', error);
    }
    return null;
  }

  // Save configuration to localStorage
  saveConfig(config: LLMConfig): void {
    try {
      this.config = config;
      localStorage.setItem('adaptive-agent-llm-config', JSON.stringify(config));
      initializeLLM(config);
    } catch (error) {
      console.error('Error saving LLM config:', error);
    }
  }

  // Get current configuration
  getConfig(): LLMConfig | null {
    return this.config || this.loadConfig();
  }

  // Update configuration
  updateConfig(updates: Partial<LLMConfig>): void {
    const current = this.getConfig();
    if (current) {
      const newConfig = { ...current, ...updates };
      this.saveConfig(newConfig);
    }
  }

  // Test LLM connection
  async testConnection(): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      const config = this.getConfig();
      if (!config) {
        return { success: false, error: 'No LLM configuration found' };
      }

      const messages = [
        createSystemMessage('You are a helpful AI assistant. Respond with a simple greeting.'),
        createUserMessage('Hello, can you confirm this connection is working?'),
      ];

      const response = await generateLLMResponse(messages);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get available models for each provider
  getAvailableModels(provider: string): string[] {
    const models: Record<string, string[]> = {
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'],
      anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      openrouter: [
        'anthropic/claude-3-haiku',
        'anthropic/claude-3-sonnet',
        'anthropic/claude-3-opus',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'openai/gpt-4-turbo',
        'meta-llama/llama-3.1-405b-instruct',
        'meta-llama/llama-3.1-70b-instruct',
        'meta-llama/llama-3.1-8b-instruct',
        'google/gemini-pro-1.5',
        'google/gemini-flash-1.5',
        'mistralai/mistral-7b-instruct',
        'mistralai/mixtral-8x7b-instruct'
      ],
      ollama: ['llama3:instruct', 'llama3:8b', 'llama2:7b', 'codellama:7b', 'mistral:7b'],
      mock: ['mock-llm-v1'],
    };
    return models[provider] || [];
  }
}

// Export singleton instance
export const llmConfigManager = LLMConfigManager.getInstance();

// Agent-specific LLM operations
export class AgentLLMService {
  static async generateAgentResponse(
    agentType: keyof typeof AGENT_PROMPTS,
    userMessage: string,
    context?: string
  ): Promise<string> {
    try {
      const config = llmConfigManager.getConfig();
      if (!config) {
        throw new Error('LLM not configured. Please set up LLM connection in settings.');
      }

      const systemPrompt = AGENT_PROMPTS[agentType];
      const messages = [
        createSystemMessage(systemPrompt),
        createUserMessage(userMessage),
      ];

      if (context) {
        messages.splice(1, 0, createSystemMessage(`Additional Context: ${context}`));
      }

      const response = await generateLLMResponse(messages);
      return response.content;
    } catch (error) {
      console.error(`Error generating ${agentType} response:`, error);
      throw error;
    }
  }

  static async searchAndAnalyze(query: string, agentType: 'research' | 'data' = 'research'): Promise<{
    summary: string;
    keyPoints: string[];
    sources: string[];
  }> {
    try {
      const systemPrompt = agentType === 'research'
        ? AGENT_PROMPTS.research
        : AGENT_PROMPTS.data;

      const searchPrompt = `
Please analyze and provide information about: "${query}"

Provide your response in the following JSON format:
{
  "summary": "A comprehensive summary of the topic",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "sources": ["Source 1", "Source 2", "Source 3"]
}
`;

      const messages = [
        createSystemMessage(systemPrompt),
        createUserMessage(searchPrompt),
      ];

      const response = await generateLLMResponse(messages);

      try {
        const parsed = JSON.parse(response.content);
        return {
          summary: parsed.summary || response.content,
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        };
      } catch {
        // If JSON parsing fails, return the raw response
        return {
          summary: response.content,
          keyPoints: [],
          sources: [],
        };
      }
    } catch (error) {
      console.error('Error in search and analysis:', error);
      throw error;
    }
  }

  static async processMcPWorkflow(
    monitorData: any,
    contextData: any,
    personalizationData: any
  ): Promise<{
    analysis: string;
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      const workflowPrompt = `
You are processing an McP (Monitor-Contextualize-Personalize) workflow. Analyze the following data and provide insights:

MONITOR DATA: ${JSON.stringify(monitorData)}
CONTEXT DATA: ${JSON.stringify(contextData)}
PERSONALIZATION DATA: ${JSON.stringify(personalizationData)}

Provide your response in the following JSON format:
{
  "analysis": "Comprehensive analysis of the workflow data",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "nextSteps": ["Next step 1", "Next step 2", "Next step 3"]
}
`;

      const messages = [
        createSystemMessage(AGENT_PROMPTS.workflow),
        createUserMessage(workflowPrompt),
      ];

      const response = await generateLLMResponse(messages);

      try {
        const parsed = JSON.parse(response.content);
        return {
          analysis: parsed.analysis || response.content,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
        };
      } catch {
        return {
          analysis: response.content,
          recommendations: [],
          nextSteps: [],
        };
      }
    } catch (error) {
      console.error('Error in McP workflow processing:', error);
      throw error;
    }
  }
}

// Default configurations for easy setup
export const DEFAULT_LLM_CONFIGS = {
  openai: {
    provider: 'openai' as const,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  anthropic: {
    provider: 'anthropic' as const,
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 2000,
  },
  ollama: {
    provider: 'ollama' as const,
    model: 'llama3:instruct',
    temperature: 0.7,
    maxTokens: 2000,
  },
  mock: {
    provider: 'mock' as const,
    model: 'mock-llm-v1',
    temperature: 0.7,
    maxTokens: 2000,
  },
};