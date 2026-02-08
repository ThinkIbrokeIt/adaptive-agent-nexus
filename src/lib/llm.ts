// LLM Service Configuration
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'mock';
  apiKey?: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

// Default configurations
export const DEFAULT_CONFIGS: Record<string, Partial<LLMConfig>> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 2000,
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3-haiku',
    temperature: 0.7,
    maxTokens: 2000,
  },
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'llama3:instruct',
    temperature: 0.7,
    maxTokens: 2000,
  },
  mock: {
    model: 'mock-llm',
    temperature: 0.7,
    maxTokens: 2000,
  },
};

class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = { ...DEFAULT_CONFIGS[config.provider], ...config };
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(messages);
      case 'openrouter':
        return this.callOpenAI(messages); // OpenRouter uses OpenAI-compatible API
      case 'anthropic':
        return this.callAnthropic(messages);
      case 'ollama':
        return this.callOllama(messages);
      case 'mock':
      default:
        return this.callMock(messages);
    }
  }

  private async callOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0].finish_reason,
    };
  }

  private async callAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${this.config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage?.content,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      model: data.model,
      finishReason: data.stop_reason,
    };
  }

  private async callOllama(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${this.config.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      usage: data.prompt_eval_count ? {
        promptTokens: data.prompt_eval_count,
        completionTokens: data.eval_count,
        totalTokens: data.prompt_eval_count + data.eval_count,
      } : undefined,
      model: data.model,
      finishReason: data.done_reason,
    };
  }

  private async callMock(messages: LLMMessage[]): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    // Generate mock response based on input
    let content = '';

    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      content = "Hello! I'm your adaptive agent assistant. I'm designed to help with McP workflow operations and knowledge retrieval. How can I assist you today?";
    } else if (userMessage.toLowerCase().includes('mcp')) {
      content = "The McP (Monitor-Contextualize-Personalize) workflow is a sophisticated framework for adaptive AI interactions. It consists of three main phases: monitoring user interactions, contextualizing data and knowledge, and personalizing responses based on learned patterns. This approach enables continuous learning and improvement of AI agent capabilities.";
    } else if (userMessage.toLowerCase().includes('search') || userMessage.toLowerCase().includes('find')) {
      content = `I understand you're looking for information. Based on my knowledge base and the McP framework, I can help you search for "${userMessage.replace(/search|find/gi, '').trim()}". My search capabilities integrate with various data sources to provide comprehensive and contextual results.`;
    } else {
      content = `Thank you for your query: "${userMessage}". As an adaptive agent using the McP framework, I'm processing your request through my monitoring, contextualization, and personalization systems. This allows me to provide responses that are tailored to your specific needs and context.`;
    }

    if (systemMessage) {
      content = `System context: ${systemMessage}\n\n${content}`;
    }

    return {
      content,
      usage: {
        promptTokens: Math.floor(userMessage.length / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((userMessage.length + content.length) / 4),
      },
      model: 'mock-llm-v1',
      finishReason: 'stop',
    };
  }
}

// Global LLM service instance
let llmService: LLMService | null = null;

export const initializeLLM = (config: LLMConfig) => {
  llmService = new LLMService(config);
};

export const getLLMService = (): LLMService => {
  if (!llmService) {
    // Default to mock if not initialized
    llmService = new LLMService({ provider: 'mock' });
  }
  return llmService;
};

export const generateLLMResponse = async (
  messages: LLMMessage[],
  config?: Partial<LLMConfig>
): Promise<LLMResponse> => {
  const service = getLLMService();

  if (config) {
    // Create temporary service with custom config
    const tempService = new LLMService({ ...service['config'], ...config });
    return tempService.generateResponse(messages);
  }

  return service.generateResponse(messages);
};

// Utility functions for common LLM operations
export const createSystemMessage = (content: string): LLMMessage => ({
  role: 'system',
  content,
});

export const createUserMessage = (content: string): LLMMessage => ({
  role: 'user',
  content,
});

export const createAssistantMessage = (content: string): LLMMessage => ({
  role: 'assistant',
  content,
});

// Predefined system prompts for different agent types
export const AGENT_PROMPTS = {
  primary: `You are the Primary Agent in an adaptive multi-agent system using the McP (Monitor-Contextualize-Personalize) framework. Your role is to coordinate other agents, handle general conversations, and ensure smooth workflow execution. You should be helpful, professional, and focused on maintaining system coherence.`,

  research: `You are the Research Agent specializing in information gathering and analysis. Your expertise includes web search, data retrieval, and knowledge synthesis. You excel at finding relevant information and providing comprehensive research results to support the McP workflow.`,

  workflow: `You are the Workflow Agent responsible for executing the McP (Monitor-Contextualize-Personalize) process. You manage the three phases: monitoring user interactions, contextualizing data, and personalizing responses. You ensure smooth workflow execution and continuous improvement.`,

  data: `You are the Data Agent specializing in database operations, data analysis, and information retrieval. You handle queries, data processing, and provide insights from structured and unstructured data sources to support agent operations.`,

  learning: `You are the Learning Agent focused on system adaptation and continuous improvement. You analyze feedback loops, identify patterns, and help evolve agent capabilities through machine learning and experience-based optimization.`,
};