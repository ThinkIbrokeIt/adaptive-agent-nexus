
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SystemHealthProps {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  storageUsage: number;
  storageTotal: number;
  apiLatency: number;
  databaseStatus: 'online' | 'offline' | 'degraded';
  n8nWorkflowsActive: number;
  vectorSearchStatus: 'operational' | 'degraded' | 'offline';
  llmServiceStatus: 'ready' | 'busy' | 'offline';
}

const SystemHealth = ({
  cpuUsage,
  memoryUsage,
  memoryTotal,
  storageUsage,
  storageTotal,
  apiLatency,
  databaseStatus,
  n8nWorkflowsActive,
  vectorSearchStatus,
  llmServiceStatus
}: SystemHealthProps) => {
  const memoryPercentage = (memoryUsage / memoryTotal) * 100;
  const storagePercentage = (storageUsage / storageTotal) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'operational':
      case 'ready':
        return 'text-green-400 bg-green-950/30 border-green-900/50';
      case 'busy':
        return 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50';
      case 'degraded':
        return 'text-orange-400 bg-orange-950/30 border-orange-900/50';
      case 'offline':
        return 'text-red-400 bg-red-950/30 border-red-900/50';
      default:
        return 'text-slate-400 bg-slate-950/30 border-slate-900/50';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-400';
    if (latency < 200) return 'text-yellow-400';
    if (latency < 500) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return 'Excellent (< 100ms)';
    if (latency < 200) return 'Good (< 200ms)';
    if (latency < 500) return 'Slow (200-500ms)';
    return 'Poor (> 500ms)';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>CPU Usage</span>
              <span>{cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={cpuUsage} className="h-2" />
            <div className="text-xs text-slate-400">
              {cpuUsage < 30 ? 'Low' : cpuUsage < 70 ? 'Moderate' : cpuUsage < 90 ? 'High' : 'Critical'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span>{memoryUsage.toFixed(1)}GB / {memoryTotal}GB</span>
            </div>
            <Progress value={memoryPercentage} className="h-2" />
            <div className="text-xs text-slate-400">{memoryPercentage.toFixed(1)}% utilized</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span>{storageUsage.toFixed(1)}GB / {storageTotal}GB</span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <div className="text-xs text-slate-400">{storagePercentage.toFixed(1)}% utilized</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>API Latency</span>
              <span className={getLatencyColor(apiLatency)}>{apiLatency}ms</span>
            </div>
            <Progress value={Math.min(100, apiLatency / 5)} className="h-2" />
            <div className="text-xs text-slate-400">{getLatencyStatus(apiLatency)}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`border rounded-md p-3 ${getStatusColor(databaseStatus)}`}>
            <div className="text-xs">Database Status</div>
            <div className="text-sm font-medium capitalize">{databaseStatus}</div>
          </div>

          <div className={`border rounded-md p-3 ${getStatusColor(n8nWorkflowsActive > 0 ? 'online' : 'offline')}`}>
            <div className="text-xs">n8n Workflows</div>
            <div className="text-sm font-medium">{n8nWorkflowsActive} Active</div>
          </div>

          <div className={`border rounded-md p-3 ${getStatusColor(vectorSearchStatus)}`}>
            <div className="text-xs">Vector Search</div>
            <div className="text-sm font-medium capitalize">{vectorSearchStatus}</div>
          </div>

          <div className={`border rounded-md p-3 ${getStatusColor(llmServiceStatus)}`}>
            <div className="text-xs">LLM Service</div>
            <div className="text-sm font-medium capitalize">{llmServiceStatus}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
