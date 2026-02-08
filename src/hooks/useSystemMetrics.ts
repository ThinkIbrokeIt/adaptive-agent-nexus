import { useState, useEffect } from 'react';

interface SystemMetrics {
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

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 28,
    memoryUsage: 1.2,
    memoryTotal: 4,
    storageUsage: 2.1,
    storageTotal: 10,
    apiLatency: 178,
    databaseStatus: 'online',
    n8nWorkflowsActive: 3,
    vectorSearchStatus: 'operational',
    llmServiceStatus: 'ready'
  });

  // Simulate CPU usage fluctuations - intentionally runs once with interval cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const cpuInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10))
      }));
    }, 3000);

    return () => clearInterval(cpuInterval);
  }, []);

  // Simulate memory usage fluctuations - intentionally runs once with interval cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      setMetrics(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.2;
        const newUsage = Math.max(0.5, Math.min(3.5, prev.memoryUsage + fluctuation));
        return {
          ...prev,
          memoryUsage: newUsage
        };
      });
    }, 5000);

    return () => clearInterval(memoryInterval);
  }, []);

  // Simulate storage usage gradual increase - intentionally runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const storageInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        storageUsage: Math.min(prev.storageTotal * 0.9, prev.storageUsage + Math.random() * 0.1)
      }));
    }, 10000);

    return () => clearInterval(storageInterval);
  }, []);

  // Monitor API latency by making test requests - intentionally runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const latencyInterval = setInterval(async () => {
      const startTime = performance.now();

      try {
        // Test API latency with a simple fetch request
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
        });

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        setMetrics(prev => ({
          ...prev,
          apiLatency: latency
        }));
      } catch (error) {
        // If API request fails, set high latency
        setMetrics(prev => ({
          ...prev,
          apiLatency: 500 + Math.random() * 500
        }));
      }
    }, 8000);

    return () => clearInterval(latencyInterval);
  }, []);

  // Simulate service status changes - intentionally runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const serviceInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        databaseStatus: Math.random() > 0.95 ? 'degraded' : 'online',
        n8nWorkflowsActive: Math.max(0, Math.min(10, prev.n8nWorkflowsActive + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0))),
        vectorSearchStatus: Math.random() > 0.98 ? 'degraded' : 'operational',
        llmServiceStatus: Math.random() > 0.96 ? 'busy' : 'ready'
      }));
    }, 15000);

    return () => clearInterval(serviceInterval);
  }, []);

  return metrics;
};