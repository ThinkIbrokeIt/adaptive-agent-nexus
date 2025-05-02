
import { useState, useCallback } from "react";
import { LogEntry } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { useToast } from "@/hooks/use-toast";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { processSearchCommand } from "@/utils/agent-commands/searchCommands";
import { processWorkflowCommand } from "@/utils/agent-commands/workflowCommands";
import { 
  processHelpCommand, 
  processStatusCommand, 
  processClearCommand, 
  processFeedbackCommand, 
  processVoiceCommand,
  processQueryCommand 
} from "@/utils/agent-commands/infoCommands";
import { 
  processTellMeAboutCommand, 
  processConversationalQuery 
} from "@/utils/agent-commands/conversationCommands";

export const useAgentCommands = (initialLogs: LogEntry[] = []) => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { toast } = useToast();
  const { speakText } = useSpeechSynthesis();
  const agentNetwork = useAgentNetwork();

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const newLog: LogEntry = { 
      timestamp: new Date().toISOString(),
      type, 
      message 
    };
    
    setLogs(prev => [...prev, newLog]);

    // Speak response for certain message types if voice is enabled
    if (voiceEnabled && (type === "info" || type === "success" || type === "system")) {
      speakText(message);
    }
  }, [voiceEnabled, speakText]);

  const handleCommand = async (commandText: string) => {
    // Add the command to the log
    addLog("command", commandText);
    
    try {
      // Process different types of commands
      const lowerCommand = commandText.toLowerCase();
      
      if (lowerCommand === "help") {
        processHelpCommand(addLog);
      } else if (lowerCommand === "status") {
        processStatusCommand(addLog, feedbackEnabled, voiceEnabled, agentNetwork);
      } else if (lowerCommand === "clear") {
        processClearCommand(setLogs);
      } else if (lowerCommand.startsWith("feedback")) {
        processFeedbackCommand(commandText, addLog, feedbackEnabled, setFeedbackEnabled);
      } else if (lowerCommand.startsWith("voice")) {
        processVoiceCommand(commandText, addLog, voiceEnabled, setVoiceEnabled);
      } else if (lowerCommand.startsWith("search")) {
        processSearchCommand(commandText, addLog, setIsSearching, agentNetwork);
      } else if (lowerCommand.includes("workflow") || lowerCommand.includes("run")) {
        processWorkflowCommand(addLog, feedbackEnabled);
      } else if (lowerCommand.startsWith("query") || lowerCommand.includes("data")) {
        processQueryCommand(addLog);
      } else if (lowerCommand.startsWith("tell me about")) {
        processTellMeAboutCommand(commandText, addLog, setIsSearching, agentNetwork);
      } else {
        // Process via agent network for complex commands
        try {
          // Process the command through the agent network
          const result = await agentNetwork.processCommand(commandText);
          
          if (result.error) {
            addLog("error", result.error);
            return;
          }
          
          // Log which agent handled the command
          addLog("system", `${result.agent} is processing your request...`);
          
          // Based on the result type, execute appropriate processing
          switch (result.type) {
            case "search":
              processSearchCommand(`search ${result.result.split(": ")[1]}`, addLog, setIsSearching, agentNetwork);
              break;
            case "workflow":
              processWorkflowCommand(addLog, feedbackEnabled);
              break;
            case "data-query":
              processQueryCommand(addLog);
              break;
            case "learning":
              const topic = result.result.split(": ")[1];
              addLog("info", `Learning about "${topic}" has been completed.`);
              addLog("success", `${result.agent} has added new information about "${topic}" to the knowledge base.`);
              break;
            case "conversation":
              addLog("info", `Response: ${result.result.split(": ")[1]}`);
              break;
            default:
              processConversationalQuery(commandText, addLog, setIsSearching, agentNetwork);
          }
        } catch (error) {
          // Fallback to conversational query if agent network fails
          processConversationalQuery(commandText, addLog, setIsSearching, agentNetwork);
        }
      }
    } catch (error) {
      addLog("error", `Error processing command: ${error}`);
    }
    
    toast({
      title: "Command Processed",
      description: commandText,
    });
  };

  return {
    logs,
    isListening,
    setIsListening,
    isSearching,
    feedbackEnabled,
    voiceEnabled,
    setVoiceEnabled,
    addLog,
    handleCommand
  };
};
