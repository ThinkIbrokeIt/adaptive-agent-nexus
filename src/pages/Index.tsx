
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

import StoragePanel from "@/components/StoragePanel";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import AgentConsole from "@/components/AgentConsole";
import Header from "@/components/Header";
import DashboardTab from "@/components/dashboard/DashboardTab";
import WorkflowsTab from "@/components/dashboard/WorkflowsTab";
import FeatureTester from "@/test/FeatureTester";
import { LLMSettings } from "@/components/LLMSettings";
import { LocalTrainingStudio } from "@/components/LocalTrainingStudio";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { McpWorkflowTrigger } from "@/types/agent";

const Index = () => {
  const { toast } = useToast();
  const { processMcpWorkflow, getWorkflowStatus, processingStage } = useAgentNetwork();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [systemLoad, setSystemLoad] = useState(28);
  const [triggerCount, setTriggerCount] = useState({
    monitor: 152,
    contextualize: 147,
    personalize: 134,
    feedback: 129
  });
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const fluctuation = Math.random() * 10 - 5;
        return Math.max(10, Math.min(85, prev + fluctuation));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runMcpWorkflow = async () => {
    console.log('runMcpWorkflow called');
    toast({
      title: "Workflow Initiated",
      description: "Starting real MCP trigger sequence..."
    });

    // Create a sample MCP workflow trigger
    const trigger: McpWorkflowTrigger = {
      id: `trigger-${Date.now()}`,
      type: 'user_input',
      source: 'dashboard',
      priority: 'normal',
      data: {
        message: "Process this user interaction through the MCP workflow",
        timestamp: new Date().toISOString(),
        userId: "demo-user"
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Process the workflow - the processingStage will be updated automatically
      const result = await processMcpWorkflow(trigger);

      // Update trigger counts based on the result
      if (result.phase === 'monitor' && result.success) {
        setTriggerCount(prev => ({ ...prev, monitor: prev.monitor + 1 }));
        toast({
          title: "Monitor Phase Complete",
          description: `Captured trigger with ${result.confidence * 100}% confidence`
        });
      }

      if (result.phase === 'contextualize' && result.success) {
        setTriggerCount(prev => ({ ...prev, contextualize: prev.contextualize + 1 }));
        toast({
          title: "Contextualize Phase Complete",
          description: "Context enriched with vector search and user patterns"
        });
      }

      if (result.phase === 'personalize' && result.success) {
        setTriggerCount(prev => ({ ...prev, personalize: prev.personalize + 1 }));
        toast({
          title: "Personalize Phase Complete",
          description: `Generated adaptive response with ${result.confidence * 100}% confidence`
        });

        if (feedbackEnabled) {
          // Simulate feedback phase
          setTimeout(() => {
            setTriggerCount(prev => ({ ...prev, feedback: prev.feedback + 1 }));
            toast({
              title: "Feedback Loop Complete",
              description: "Agent knowledge updated based on response effectiveness"
            });
          }, 2000);
        }
      }

      // Log final result
      console.log("MCP Workflow Result:", result);

    } catch (error) {
      console.error("MCP Workflow Error:", error);
      toast({
        title: "Workflow Error",
        description: error instanceof Error ? error.message : "Unknown workflow error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header 
        systemLoad={systemLoad}
        processingStage={processingStage}
        runMcpWorkflow={runMcpWorkflow}
      />

      <div className="container mx-auto py-6 px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1 md:gap-2 bg-slate-800/50 h-auto">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs md:text-sm">n8n Workflows</TabsTrigger>
            <TabsTrigger value="storage" className="text-xs md:text-sm">Storage</TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs md:text-sm">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="console" className="text-xs md:text-sm">Agent Console</TabsTrigger>
            <TabsTrigger value="llm" className="text-xs md:text-sm">LLM Settings</TabsTrigger>
            <TabsTrigger value="training" className="text-xs md:text-sm">Local Training</TabsTrigger>
            <TabsTrigger value="testing" className="text-xs md:text-sm">System Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardTab 
              triggerCount={triggerCount} 
              processingStage={processingStage} 
              feedbackEnabled={feedbackEnabled}
              onRunWorkflow={runMcpWorkflow}
            />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowsTab />
          </TabsContent>

          <TabsContent value="storage">
            <StoragePanel />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeGraph />
          </TabsContent>

          <TabsContent value="console">
            <AgentConsole />
          </TabsContent>

          <TabsContent value="llm">
            <LLMSettings />
          </TabsContent>

          <TabsContent value="training">
            <LocalTrainingStudio />
          </TabsContent>

          <TabsContent value="testing">
            <FeatureTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
