
export interface LogEntry {
  timestamp: string;
  type: "system" | "info" | "error" | "success" | "command" | "search";
  message: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}
