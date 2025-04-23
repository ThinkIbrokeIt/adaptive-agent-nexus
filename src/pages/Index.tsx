
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

import WorkflowVisualizer from "@/components/WorkflowVisualizer";
import StoragePanel from "@/components/StoragePanel";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import AgentConsole from "@/components/AgentConsole";
import SystemHealth from "@/components/SystemHealth";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [systemLoad, setSystemLoad] = useState(28);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [triggerCount, setTriggerCount] = useState({
    monitor: 152,
    contextualize: 147,
    personalize: 134
  });

  useEffect(() => {
    // Simulate some system activity
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const fluctuation = Math.random() * 10 - 5;
        return Math.max(10, Math.min(85, prev + fluctuation));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate a McP workflow execution
  const runMcpWorkflow = () => {
    toast({
      title: "Workflow Initiated",
      description: "Starting McP trigger sequence..."
    });
    
    // Monitor phase
    setProcessingStage("monitor");
    setTimeout(() => {
      setTriggerCount(prev => ({ ...prev, monitor: prev.monitor + 1 }));
      toast({ title: "Monitor Phase Complete", description: "User interaction captured and stored in DuckDB" });
      
      // Contextualize phase
      setProcessingStage("contextualize");
      setTimeout(() => {
        setTriggerCount(prev => ({ ...prev, contextualize: prev.contextualize + 1 }));
        toast({ title: "Contextualize Phase Complete", description: "Knowledge vector search completed" });
        
        // Personalize phase
        setProcessingStage("personalize");
        setTimeout(() => {
          setTriggerCount(prev => ({ ...prev, personalize: prev.personalize + 1 }));
          toast({ title: "Personalize Phase Complete", description: "Adaptive response generated successfully" });
          setProcessingStage(null);
        }, 2000);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                <span className="font-bold">A²</span>
              </div>
              <h1 className="text-xl font-bold">Adaptive Agent Nexus</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-slate-800">
                System Load: {systemLoad.toFixed(1)}%
              </Badge>
              <Button size="sm" variant="outline" onClick={runMcpWorkflow} disabled={!!processingStage}>
                {processingStage ? `Processing: ${processingStage}` : "Run McP Workflow"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-2 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workflows">n8n Workflows</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="console">Agent Console</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monitor Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{triggerCount.monitor}</div>
                  <p className="text-sm text-slate-400 mt-1">Total triggers captured</p>
                  {processingStage === "monitor" && (
                    <Progress value={45} className="h-1 mt-4" />
                  )}
                </CardContent>
                <CardFooter className="text-xs text-slate-500 pt-0">
                  DuckDB + Webhook Triggers
                </CardFooter>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contextualize Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{triggerCount.contextualize}</div>
                  <p className="text-sm text-slate-400 mt-1">Context enrichments</p>
                  {processingStage === "contextualize" && (
                    <Progress value={60} className="h-1 mt-4" />
                  )}
                </CardContent>
                <CardFooter className="text-xs text-slate-500 pt-0">
                  ChromaDB + Vector Search
                </CardFooter>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personalize Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{triggerCount.personalize}</div>
                  <p className="text-sm text-slate-400 mt-1">Adaptive responses</p>
                  {processingStage === "personalize" && (
                    <Progress value={80} className="h-1 mt-4" />
                  )}
                </CardContent>
                <CardFooter className="text-xs text-slate-500 pt-0">
                  SQLite + MinIO Storage
                </CardFooter>
              </Card>
            </div>

            <SystemHealth />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Triggers</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  {[
                    { timestamp: "2025-04-23T14:32:05Z", type: "monitor", data: "ambient music production query" },
                    { timestamp: "2025-04-23T14:30:22Z", type: "contextualize", data: "matched with sound design conversations" },
                    { timestamp: "2025-04-23T14:28:11Z", type: "personalize", data: "generated Ableton Live tutorial plan" },
                    { timestamp: "2025-04-23T14:15:47Z", type: "monitor", data: "electronic music production basics" },
                    { timestamp: "2025-04-23T13:52:18Z", type: "contextualize", data: "identified knowledge gap: sound synthesis" },
                  ].map((item, idx) => (
                    <div key={idx} className="py-2 border-t border-slate-700 first:border-t-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant={item.type === "monitor" ? "default" : item.type === "contextualize" ? "secondary" : "outline"} className="mb-1">
                            {item.type}
                          </Badge>
                          <p className="text-sm">{item.data}</p>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="link" size="sm" className="ml-auto">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <WorkflowVisualizer />
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>n8n Workflow Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 p-4 rounded-md text-xs font-mono overflow-x-auto">
                  {`{
  "nodes": [
    {
      "type": "httpRequest",
      "name": "UserInputCapture",
      "parameters": {
        "url": "{{$localEnv.AGENT_ENDPOINT}}/webhook",
        "method": "POST"
      }
    },
    {
      "type": "function",
      "name": "LogToDuckDB",
      "parameters": {
        "jsCode": "await $storage.write('interactions', { 
          input: $json.data.text,
          timestamp: new Date().toISOString(),
          context_flags: $json.metadata.contextTypes 
        }); return $json;"
      }
    },
    {
      "type": "aiTool",
      "name": "GenerateLessonPlan",
      "parameters": {
        "service": "local-ollama",
        "model": "llama3:instruct",
        "prompt": "Based on {{$json.context}} and user's {{$json.goals}}, create a personalized lesson plan with..."
      }
    }
  ]
}`}
                </div>
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
