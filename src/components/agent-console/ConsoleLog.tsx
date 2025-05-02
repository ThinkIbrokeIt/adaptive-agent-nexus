
import React from "react";
import { LogEntry, SearchResult } from "@/types/agent";

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const renderLogContent = (log: LogEntry) => {
    if (log.type === "search") {
      try {
        const searchResults = JSON.parse(log.message) as SearchResult[];
        
        return (
          <div className="ml-5 mt-1 space-y-2">
            {searchResults.map((result, i) => (
              <div key={i} className="border-l-2 border-blue-500 pl-2 py-1">
                <div className="text-blue-400 hover:underline">{result.title}</div>
                <div className="text-slate-400 text-xs">{result.snippet}</div>
                <div className="text-emerald-500 text-xs">{result.url}</div>
              </div>
            ))}
          </div>
        );
      } catch (e) {
        return <span className="text-slate-300">{log.message}</span>;
      }
    }
    
    return (
      <span className={`${log.type === "command" ? "text-white font-medium" : "text-slate-300"}`}>
        {log.message}
      </span>
    );
  };

  return (
    <div className="bg-black rounded-md p-3 font-mono text-xs h-80 overflow-y-auto flex flex-col space-y-1">
      {logs.map((log, idx) => (
        <div key={idx} className="flex flex-col">
          <div className="flex">
            <span className="text-slate-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span 
              className={`mr-1 ${
                log.type === "error" ? "text-red-500" : 
                log.type === "success" ? "text-green-500" : 
                log.type === "system" ? "text-yellow-500" :
                log.type === "command" ? "text-cyan-500" :
                log.type === "search" ? "text-blue-500" :
                "text-slate-300"
              }`}
            >
              {log.type === "command" ? ">" : 
               log.type === "search" ? "🔍" : 
               log.type}:
            </span>
            {renderLogContent(log)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsoleLog;
