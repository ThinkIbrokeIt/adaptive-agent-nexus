
import { LogEntry } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";

export const processHelpCommand = (
  addLog: (type: LogEntry["type"], message: string) => void
) => {
  addLog("info", "Available commands: run workflow, query [db] [params], status, clear, search [query], feedback [on|off], voice [on|off], learn [topic]");
  addLog("info", "You can also direct commands to specific agents: @research search for [topic], @workflow run [name], @data query [database], @learning study [topic]");
};

export const processStatusCommand = (
  addLog: (type: LogEntry["type"], message: string) => void,
  feedbackEnabled: boolean,
  voiceEnabled: boolean,
  agentNetwork: ReturnType<typeof useAgentNetwork>
) => {
  addLog("info", "System status: OPERATIONAL");
  addLog("info", "McP processors: ACTIVE (3/3)");
  addLog("info", "Memory usage: 1.2GB / 4GB");
  addLog("info", "Storage status: CONNECTED");
  addLog("info", `Feedback loop: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
  addLog("info", `Voice interface: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
  
  // Add agent network status
  addLog("info", "Agent network: OPERATIONAL");
  agentNetwork.network.agents.forEach(agent => {
    addLog("info", `${agent.name}: ${agent.status.toUpperCase()}`);
  });
};

export const processClearCommand = (
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  setLogs([{
    timestamp: new Date().toISOString(),
    type: "system",
    message: "Console cleared."
  }]);
};

export const processFeedbackCommand = (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  feedbackEnabled: boolean,
  setFeedbackEnabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (commandText.toLowerCase().includes("on")) {
    setFeedbackEnabled(true);
    addLog("success", "Feedback loop enabled. Agent will continuously learn from interactions.");
  } else if (commandText.toLowerCase().includes("off")) {
    setFeedbackEnabled(false);
    addLog("info", "Feedback loop disabled. Agent will not adapt from interactions.");
  } else {
    addLog("info", `Current feedback status: ${feedbackEnabled ? "ENABLED" : "DISABLED"}`);
  }
};

export const processVoiceCommand = (
  commandText: string,
  addLog: (type: LogEntry["type"], message: string) => void,
  voiceEnabled: boolean,
  setVoiceEnabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (commandText.toLowerCase().includes("on")) {
    setVoiceEnabled(true);
    addLog("success", "Voice output enabled.");
  } else if (commandText.toLowerCase().includes("off")) {
    setVoiceEnabled(false);
    addLog("info", "Voice output disabled.");
  } else {
    addLog("info", `Current voice status: ${voiceEnabled ? "ENABLED" : "DISABLED"}`);
  }
};

export const processQueryCommand = (
  addLog: (type: LogEntry["type"], message: string) => void
) => {
  addLog("system", "Executing database query...");
  setTimeout(() => {
    addLog("info", "Query returned 5 results.");
  }, 1500);
};
