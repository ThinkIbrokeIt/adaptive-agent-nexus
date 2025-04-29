
export interface LogEntry {
  timestamp: string;
  type: "system" | "info" | "error" | "success" | "command";
  message: string;
}
