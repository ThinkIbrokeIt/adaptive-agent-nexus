
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SystemHealth = () => {
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
              <span>28%</span>
            </div>
            <Progress value={28} className="h-2" />
            <div className="text-xs text-slate-400">4 cores @ 2.6 GHz</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span>1.2GB / 4GB</span>
            </div>
            <Progress value={30} className="h-2" />
            <div className="text-xs text-slate-400">30% utilized</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span>2.1GB / 10GB</span>
            </div>
            <Progress value={21} className="h-2" />
            <div className="text-xs text-slate-400">21% utilized</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>API Latency</span>
              <span>178ms</span>
            </div>
            <Progress value={35} className="h-2" />
            <div className="text-xs text-slate-400">Good (under 200ms)</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-950/30 border border-green-900/50 rounded-md p-3">
            <div className="text-xs text-green-400">Database Status</div>
            <div className="text-sm font-medium text-green-300">Online</div>
          </div>
          
          <div className="bg-green-950/30 border border-green-900/50 rounded-md p-3">
            <div className="text-xs text-green-400">n8n Workflows</div>
            <div className="text-sm font-medium text-green-300">3 Active</div>
          </div>
          
          <div className="bg-green-950/30 border border-green-900/50 rounded-md p-3">
            <div className="text-xs text-green-400">Vector Search</div>
            <div className="text-sm font-medium text-green-300">Operational</div>
          </div>
          
          <div className="bg-green-950/30 border border-green-900/50 rounded-md p-3">
            <div className="text-xs text-green-400">LLM Service</div>
            <div className="text-sm font-medium text-green-300">Ready</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
