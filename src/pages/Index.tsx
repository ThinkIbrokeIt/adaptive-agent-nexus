
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

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [systemLoad, setSystemLoad] = useState(28);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
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

  const runMcpWorkflow = () => {
    toast({
      title: "Workflow Initiated",
      description: "Starting McP trigger sequence..."
    });
    
    setProcessingStage("monitor");
    setTimeout(() => {
      setTriggerCount(prev => ({ ...prev, monitor: prev.monitor + 1 }));
      toast({ title: "Monitor Phase Complete", description: "User interaction captured and stored in DuckDB" });
      
      setProcessingStage("contextualize");
      setTimeout(() => {
        setTriggerCount(prev => ({ ...prev, contextualize: prev.contextualize + 1 }));
        toast({ title: "Contextualize Phase Complete", description: "Knowledge vector search completed" });
        
        setProcessingStage("personalize");
        setTimeout(() => {
          setTriggerCount(prev => ({ ...prev, personalize: prev.personalize + 1 }));
          toast({ title: "Personalize Phase Complete", description: "Adaptive response generated successfully" });
          
          if (feedbackEnabled) {
            setProcessingStage("feedback");
            setTimeout(() => {
              setTriggerCount(prev => ({ ...prev, feedback: prev.feedback + 1 }));
              toast({ title: "Feedback Loop Complete", description: "Agent knowledge updated based on response effectiveness" });
              setProcessingStage(null);
            }, 2000);
          } else {
            setProcessingStage(null);
          }
        }, 2000);
      }, 3000);
    }, 2000);
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
          <TabsList className="grid grid-cols-6 gap-2 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workflows">n8n Workflows</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="console">Agent Console</TabsTrigger>
            <TabsTrigger value="testing">System Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardTab 
              triggerCount={triggerCount} 
              processingStage={processingStage} 
              feedbackEnabled={feedbackEnabled} 
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

          <TabsContent value="testing">
            <FeatureTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
