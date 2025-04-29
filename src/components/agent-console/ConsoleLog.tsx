
import React from "react";
import { LogEntry } from "@/types/agent";

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  return (
    <div className="bg-black rounded-md p-3 font-mono text-xs h-80 overflow-y-auto flex flex-col space-y-1">
      {logs.map((log, idx) => (
        <div key={idx} className="flex">
          <span className="text-slate-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span 
            className={`mr-1 ${
              log.type === "error" ? "text-red-500" : 
              log.type === "success" ? "text-green-500" : 
              log.type === "system" ? "text-yellow-500" :
              log.type === "command" ? "text-cyan-500" :
              "text-slate-300"
            }`}
          >
            {log.type === "command" ? ">" : log.type}:
          </span>
          <span className={`${log.type === "command" ? "text-white font-medium" : "text-slate-300"}`}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ConsoleLog;
