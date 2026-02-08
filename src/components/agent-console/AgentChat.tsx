import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Agent, AgentMessage, TrainingExample } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { Send, Brain, Search, Workflow, Database, Lightbulb, Settings, Zap, MessageSquare } from "lucide-react";

interface AgentChatProps {
  selectedAgent: Agent | null;
}

interface ChatMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'user' | 'agent';
}

const AgentChat: React.FC<AgentChatProps> = ({ selectedAgent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendAgentMessage, network } = useAgentNetwork();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to find the best matching training example
  const findBestTrainingMatch = (userInput: string, trainingData: TrainingExample[]): string => {
    if (!trainingData || trainingData.length === 0) {
      return "I don't have training data available for this query.";
    }

    const userInputLower = userInput.toLowerCase().trim();
    let bestMatch: TrainingExample | null = null;
    let bestScore = 0;

    // Simple keyword matching algorithm
    for (const example of trainingData) {
      const inputLower = example.input.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (inputLower === userInputLower) {
        return example.expectedOutput;
      }

      // Check for keyword matches
      const userWords = userInputLower.split(/\s+/);
      const exampleWords = inputLower.split(/\s+/);

      for (const userWord of userWords) {
        if (userWord.length > 2) { // Ignore very short words
          for (const exampleWord of exampleWords) {
            if (exampleWord.includes(userWord) || userWord.includes(exampleWord)) {
              score += 1;
            }
          }
        }
      }

      // Boost score for longer matches
      if (score > 0) {
        score += (userWords.length / exampleWords.length) * 0.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = example;
      }
    }

    // Return best match if score is above threshold, otherwise return a generic response
    if (bestMatch && bestScore > 0.1) {
      return bestMatch.expectedOutput;
    } else {
      // Fallback to a generic helpful response
      return "I'm the Console Agent with comprehensive knowledge of the Adaptive Agent Nexus system. I can help you with: system features, agent console usage, dashboard navigation, McP workflows, multi-agent architecture, voice interface, agent spawning, and more. What specific aspect would you like to know about?";
    }
  };

  // Update messages when network messages change or selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      try {
        const agentMessages = network.messages.filter(msg =>
          (msg.from === selectedAgent.id && msg.to === 'user') ||
          (msg.from === 'user' && msg.to === selectedAgent.id)
        );

        const chatMessages: ChatMessage[] = agentMessages.map(msg => {
          let content = '';
          try {
            if (typeof msg.content === 'string') {
              content = msg.content;
            } else if (msg.content && typeof msg.content === 'object' && 'message' in msg.content) {
              content = String(msg.content.message);
            } else if (msg.content && typeof msg.content === 'object') {
              content = JSON.stringify(msg.content);
            } else {
              content = String(msg.content || '');
            }
          } catch (error) {
            console.error('Error extracting message content:', error, msg.content);
            content = '[Error displaying message]';
          }

          return {
            id: `${msg.timestamp}-${msg.from}-${msg.to}`,
            from: msg.from,
            to: msg.to,
            content: content,
            timestamp: msg.timestamp,
            type: msg.from === 'user' ? 'user' : 'agent'
          };
        });

        setMessages(chatMessages);
      } catch (error) {
        console.error('Error processing messages:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [network.messages, selectedAgent]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const currentMessage = inputMessage.toLowerCase().trim();
    setInputMessage("");
    setIsTyping(true);

    try {
      // Send user message through agent network
      sendAgentMessage({
        from: 'user',
        to: selectedAgent.id,
        content: {
          type: 'direct_message',
          message: inputMessage
        }
      });

      let response = "";

      // Special handling for console agent - use training data
      if (selectedAgent.id === 'console-agent' || selectedAgent.name.toLowerCase().includes('console')) {
        // Console agent training data is stored in spawnedAgents
        const consoleAgentData = network.spawnedAgents.find(agent => agent.id === 'console-agent' || agent.name.toLowerCase().includes('console'));
        if (consoleAgentData && consoleAgentData.trainingData.length > 0) {
          response = findBestTrainingMatch(inputMessage, consoleAgentData.trainingData);
        } else {
          response = "I'm the Console Agent, but I don't have training data loaded yet. Please check the system configuration.";
        }
      } else {
        // Handle special commands
        if (currentMessage === 'help' || currentMessage === '?') {
          response = getAgentHelp(selectedAgent.type);
        } else if (currentMessage === 'status') {
          response = `Current status: ${selectedAgent.status}. I'm ${selectedAgent.isActive ? 'active' : 'inactive'} and capable of: ${selectedAgent.capabilities.join(', ')}.`;
        } else if (currentMessage.startsWith('search ') && selectedAgent.type === 'research') {
          response = `Searching for "${currentMessage.substring(7)}"... I would typically query multiple sources and provide comprehensive results.`;
        } else if (currentMessage.includes('workflow') && selectedAgent.type === 'workflow') {
          response = `Initiating McP workflow for "${currentMessage}". I'll monitor the context, process the request, and provide a personalized response.`;
        } else if (currentMessage.includes('data') && selectedAgent.type === 'data') {
          response = `Processing data query: "${currentMessage}". I'll analyze available datasets and provide insights.`;
        } else if (currentMessage.includes('learn') && selectedAgent.type === 'learning') {
          response = `Learning from "${currentMessage}". I'll update the knowledge base and improve future responses.`;
        } else {
          // Default agent-specific responses
          switch (selectedAgent.type) {
            case 'primary':
              response = `Hello! I'm the Primary Agent. I coordinate the entire agent network and can spawn specialized agents for specific tasks. You said: "${inputMessage}". I can help you spawn a new agent, manage existing ones, or coordinate complex workflows.`;
              break;
            case 'adaptive':
              response = `I'm the Adaptive Subagent, a flexible AI assistant that can be configured for various tasks. I adapt to your needs and learn from interactions. For "${inputMessage}", I'll analyze this and provide the most helpful response based on my current configuration.`;
              break;
            case 'spawned':
              response = `I'm a specialized spawned agent focused on ${selectedAgent.capabilities.join(' and ')}. I've been trained for specific tasks and can provide expert assistance in my domain. Regarding "${inputMessage}", I'll apply my specialized knowledge to help you.`;
              break;
            default:
              response = `I received your message: "${inputMessage}". I'm here to help!`;
          }
        }
      }

      // Send agent response through agent network
      setTimeout(() => {
        sendAgentMessage({
          from: selectedAgent.id,
          to: 'user',
          content: {
            type: 'direct_message',
            message: response
          }
        });
        setIsTyping(false);
      }, 800 + Math.random() * 1200);

    } catch (error) {
      setIsTyping(false);
      console.error('Failed to send message:', error);
    }
  };

  const getAgentHelp = (agentType: string) => {
    switch (agentType) {
      case 'primary':
        return "Commands: 'spawn [specialization]', 'list agents', 'help', 'status'. I coordinate the agent network and can create specialized agents.";
      case 'adaptive':
        return "Commands: 'adapt to [task]', 'learn from [example]', 'help', 'status'. I'm flexible and can adapt to different types of work.";
      case 'spawned':
        return "Commands: 'analyze [topic]', 'process [data]', 'help', 'status'. I'm specialized for specific tasks and trained for optimal performance.";
      default:
        return "Available commands: 'help', 'status', or type any message for a response.";
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case "primary": return <Brain className="h-4 w-4" />;
      case "adaptive": return <Settings className="h-4 w-4" />;
      case "spawned": return <Zap className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle": return "bg-slate-600/30 text-slate-400 border-slate-600";
      case "processing": return "bg-yellow-900/30 text-yellow-400 border-yellow-600";
      case "error": return "bg-red-900/30 text-red-400 border-red-600";
      case "success": return "bg-green-900/30 text-green-400 border-green-600";
      default: return "bg-slate-600/30 text-slate-400 border-slate-600";
    }
  };

  if (!selectedAgent) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 h-[500px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-slate-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an agent to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getAgentIcon(selectedAgent.type)}
            <span>{selectedAgent.name}</span>
          </div>
          <Badge variant="outline" className={getStatusColor(selectedAgent.status)}>
            {selectedAgent.status}
            {selectedAgent.status === "processing" && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>No messages yet. Start a conversation with {selectedAgent.name}!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t border-slate-700">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${selectedAgent.name}...`}
              className="flex-1 bg-slate-900 border-slate-600"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentChat;