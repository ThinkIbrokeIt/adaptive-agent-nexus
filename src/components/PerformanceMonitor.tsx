import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, Cpu, Zap } from "lucide-react";

interface PerformanceMetrics {
  memoryUsage: number;
  responseTime: number;
  activeConnections: number;
  errorRate: number;
  cpuUsage: number;
  uptime: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    responseTime: 0,
    activeConnections: 0,
    errorRate: 0,
    cpuUsage: 0,
    uptime: 0
  });

  const [alerts, setAlerts] = useState<Array<{
    type: "warning" | "error" | "info";
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const startTime = Date.now();
    
    const updateMetrics = () => {
      // Simulate performance metrics
      const newMetrics: PerformanceMetrics = {
        memoryUsage: Math.random() * 100,
        responseTime: 50 + Math.random() * 200,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        errorRate: Math.random() * 5,
        cpuUsage: Math.random() * 80,
        uptime: (Date.now() - startTime) / 1000
      };

      setMetrics(newMetrics);

      // Generate alerts based on metrics
      const newAlerts = [];
      if (newMetrics.memoryUsage > 85) {
        newAlerts.push({
          type: "warning" as const,
          message: "High memory usage detected",
          timestamp: new Date().toISOString()
        });
      }
      if (newMetrics.responseTime > 200) {
        newAlerts.push({
          type: "error" as const,
          message: "Response time degraded",
          timestamp: new Date().toISOString()
        });
      }
      if (newMetrics.errorRate > 3) {
        newAlerts.push({
          type: "warning" as const,
          message: "Elevated error rate detected",
          timestamp: new Date().toISOString()
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Keep only last 10 alerts
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value > thresholds.critical) return "text-red-400";
    if (value > thresholds.warning) return "text-yellow-400";
    return "text-green-400";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>System Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Memory Usage</span>
                <span className={`text-sm font-mono ${getStatusColor(metrics.memoryUsage, { warning: 70, critical: 85 })}`}>
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">CPU Usage</span>
                <span className={`text-sm font-mono ${getStatusColor(metrics.cpuUsage, { warning: 60, critical: 80 })}`}>
                  {metrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xs text-slate-400">Response Time</div>
                <div className={`text-lg font-mono ${getStatusColor(metrics.responseTime, { warning: 150, critical: 200 })}`}>
                  {metrics.responseTime.toFixed(0)}ms
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Active Connections</div>
                <div className="text-lg font-mono text-blue-400">
                  {metrics.activeConnections}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-slate-400">Error Rate</div>
                <div className={`text-lg font-mono ${getStatusColor(metrics.errorRate, { warning: 2, critical: 5 })}`}>
                  {metrics.errorRate.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Uptime</div>
                <div className="text-lg font-mono text-green-400">
                  {formatUptime(metrics.uptime)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>System Alerts</span>
            <Badge variant="outline" className="ml-auto">
              {alerts.length} alerts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-4 text-slate-400 flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>All systems operational</span>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 bg-slate-900/50 rounded-md">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200">{alert.message}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;