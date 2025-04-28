
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import WorkflowVisualizer from "@/components/WorkflowVisualizer";
import StoragePanel from "@/components/StoragePanel";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import AgentConsole from "@/components/AgentConsole";
import SystemHealth from "@/components/SystemHealth";
import Header from "@/components/Header";
import McpTriggerCards from "@/components/McpTriggerCards";
import RecentTriggers from "@/components/RecentTriggers";

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
          <TabsList className="grid grid-cols-5 gap-2 bg-slate-800/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workflows">n8n Workflows</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="console">Agent Console</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <McpTriggerCards 
              triggerCount={triggerCount}
              processingStage={processingStage}
              feedbackEnabled={feedbackEnabled}
            />
            <SystemHealth />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RecentTriggers />
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
    },
    {
      "type": "function",
      "name": "EvaluateEffectiveness",
      "parameters": {
        "jsCode": "const score = await $ai.evaluate($json.response, {
          criteria: ['relevance', 'accuracy', 'personalization'],
          threshold: 0.75
        }); return { ...json, evaluation: score };"
      }
    },
    {
      "type": "function",
      "name": "UpdateKnowledgeGraph",
      "parameters": {
        "jsCode": "if ($json.evaluation.score > 0.8) {
          await $graph.addNode({
            type: 'knowledge',
            content: $json.response,
            connections: $json.context.map(c => ({ id: c.id, weight: c.relevance }))
          });
        }
        return $json;"
      }
    },
    {
      "type": "if",
      "name": "RequiresAdaptation",
      "parameters": {
        "condition": "{{$json.evaluation.score < 0.75}}"
      }
    },
    {
      "type": "aiTool",
      "name": "ImproveModel",
      "parameters": {
        "service": "local-ollama",
        "model": "llama3:instruct",
        "action": "finetune",
        "data": "{{$json.historyWithEvaluations}}",
        "parameters": {
          "epochs": 3,
          "learning_rate": 0.00002
        }
      }
    }
  ],
  "connections": [
    {
      "source": "UserInputCapture",
      "target": "LogToDuckDB"
    },
    {
      "source": "LogToDuckDB",
      "target": "GenerateLessonPlan"
    },
    {
      "source": "GenerateLessonPlan",
      "target": "EvaluateEffectiveness"
    },
    {
      "source": "EvaluateEffectiveness",
      "target": "UpdateKnowledgeGraph"
    },
    {
      "source": "EvaluateEffectiveness",
      "target": "RequiresAdaptation"
    },
    {
      "source": "RequiresAdaptation",
      "target": "ImproveModel",
      "condition": "true"
    },
    {
      "source": "ImproveModel",
      "target": "UserInputCapture",
      "label": "Feedback Loop"
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
