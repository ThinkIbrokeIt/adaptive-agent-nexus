
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CircleArrowUp, MessageSquare, Users, Settings, Brain, Search, Workflow, Database, Lightbulb, Zap, Download } from "lucide-react";
import { LogEntry, Agent } from "@/types/agent";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { useAgentCommands } from "@/hooks/useAgentCommands";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ConsoleLog from "./agent-console/ConsoleLog";
import CommandInput from "./agent-console/CommandInput";
import AgentStatus from "./agent-console/AgentStatus";
import AgentChat from "./agent-console/AgentChat";

const initialLogs: LogEntry[] = [
  {
    timestamp: new Date("2025-04-23T14:32:05Z").toISOString(),
    type: "system",
    message: "Agent system initialized. McP framework ready.",
  },
  {
    timestamp: new Date("2025-04-23T14:32:10Z").toISOString(),
    type: "info",
    message: "Storage integrations connected: DuckDB, ChromaDB, SQLite, MinIO.",
  },
  {
    timestamp: new Date("2025-04-23T14:32:15Z").toISOString(),
    type: "info",
    message: "Local LLM initialized using llama3:instruct model.",
  },
  {
    timestamp: new Date("2025-04-23T14:32:20Z").toISOString(),
    type: "system",
    message: "Feedback loop enabled. Agent will continuously learn from interactions.",
  },
  {
    timestamp: new Date("2025-04-23T14:32:25Z").toISOString(),
    type: "system",
    message: "Voice interface activated. You can now speak to the agent.",
  },
  {
    timestamp: new Date("2025-04-23T14:32:30Z").toISOString(),
    type: "system",
    message: "Search capability enabled. You can search for information using the 'search' command.",
  }
];

const AgentConsole = () => {
  const agentNetwork = useAgentNetwork();
  const { toast } = useToast();
  const {
    logs,
    isListening,
    isSearching,
    feedbackEnabled,
    voiceEnabled,
    setVoiceEnabled,
    handleCommand
  } = useAgentCommands(initialLogs);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("console");
  const [showSpawnDialog, setShowSpawnDialog] = useState(false);
  const [spawnForm, setSpawnForm] = useState({
    name: '',
    specialization: '',
    capabilities: '',
    initialTraining: ''
  });

  const handleExportAgent = async (agentId: string) => {
    try {
      const agentExport = await agentNetwork.exportAgent(agentId);
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(agentExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `agent-${agentExport.agent.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Agent Exported Successfully",
        description: `Exported "${agentExport.agent.name}" with ${agentExport.trainingData.length} training examples`,
      });
      
    } catch (error) {
      console.error('Failed to export agent:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Agent Console</span>
              {isSearching && (
                <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-400 border-blue-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400 mr-1 animate-ping"></span>
                  Searching
                </Badge>
              )}
              {feedbackEnabled && (
                <Badge variant="outline" className="ml-2 bg-green-900/30 text-green-400 border-green-600">
                  <CircleArrowUp className="h-3 w-3 mr-1 animate-pulse" />
                  Learning
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="font-mono">v0.7.0-alpha</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="console" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Console
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Direct Chat
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Agent Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="console" className="mt-4">
              <div className="space-y-4">
                <AgentStatus agents={agentNetwork.network.agents} />
                <ConsoleLog logs={logs} />
              </div>
            </TabsContent>

            <TabsContent value="agents" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Agent Selection Panel */}
                <Card className="bg-slate-900/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Select Agent
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSpawnDialog(true)}
                        className="text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Spawn
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {agentNetwork.network.agents.map((agent) => (
                        <Button
                          key={agent.id}
                          variant={selectedAgent?.id === agent.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedAgent(agent)}
                          disabled={!agent.isActive}
                        >
                          <div className="flex items-center space-x-2">
                            {agent.type === "primary" && <Brain className="h-4 w-4" />}
                            {agent.type === "adaptive" && <Settings className="h-4 w-4" />}
                            <span>{agent.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {agent.type}
                            </Badge>
                          </div>
                        </Button>
                      ))}

                      {/* Spawned Agents Section */}
                      {agentNetwork.network.spawnedAgents.length > 0 && (
                        <>
                          <div className="border-t border-slate-600 my-4"></div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Spawned Agents</h4>
                          {agentNetwork.network.spawnedAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center space-x-2 mb-2">
                              <Button
                                variant={selectedAgent?.id === agent.id ? "default" : "outline"}
                                className="flex-1 justify-start"
                                onClick={() => setSelectedAgent({
                                  id: agent.id,
                                  name: agent.name,
                                  type: "spawned" as any,
                                  status: "idle",
                                  capabilities: agent.capabilities,
                                  isActive: true,
                                })}
                              >
                                <div className="flex items-center space-x-2">
                                  <Zap className="h-4 w-4" />
                                  <span>{agent.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {agent.specialization}
                                  </Badge>
                                </div>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExportAgent(agent.id)}
                                className="px-2"
                                title="Export trained agent"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Panel */}
                <div className="lg:col-span-2">
                  {selectedAgent ? (
                    <AgentChat selectedAgent={selectedAgent} />
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-700 h-[500px]">
                      <CardContent className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-400">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No agent selected. Please select an agent to start chatting.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-4">
              <div className="space-y-4">
                <AgentStatus agents={agentNetwork.network.agents} />
                <Card className="bg-slate-900/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Agent Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agentNetwork.network.agents.map((agent) => (
                        <div key={agent.id} className="space-y-2">
                          <h4 className="font-medium text-sm">{agent.name}</h4>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <CommandInput
            onCommandSubmit={handleCommand}
            isListening={isListening}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />
        </CardFooter>
      </Card>

      {/* Agent Spawning Dialog */}
      <Dialog open={showSpawnDialog} onOpenChange={setShowSpawnDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Spawn Specialized Agent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={spawnForm.name}
                onChange={(e) => setSpawnForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Code Review Agent"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={spawnForm.specialization}
                onChange={(e) => setSpawnForm(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="e.g., code analysis, research, data processing"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
              <Input
                id="capabilities"
                value={spawnForm.capabilities}
                onChange={(e) => setSpawnForm(prev => ({ ...prev, capabilities: e.target.value }))}
                placeholder="e.g., analysis, communication, coordination"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="initial-training">Initial Training Data (optional)</Label>
              <Textarea
                id="initial-training"
                value={spawnForm.initialTraining}
                onChange={(e) => setSpawnForm(prev => ({ ...prev, initialTraining: e.target.value }))}
                placeholder="Example interactions or training data..."
                className="bg-slate-700 border-slate-600 min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSpawnDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                if (!spawnForm.name || !spawnForm.specialization) return;

                try {
                  const capabilities = spawnForm.capabilities
                    .split(',')
                    .map(cap => cap.trim())
                    .filter(cap => cap.length > 0) as any[];

                  const initialTraining = spawnForm.initialTraining
                    ? [{ input: spawnForm.initialTraining, expectedOutput: '', feedback: 'neutral' as const, timestamp: new Date().toISOString() }]
                    : [];

                  const spawnedAgent = await agentNetwork.spawnAgent({
                    name: spawnForm.name,
                    specialization: spawnForm.specialization,
                    baseCapabilities: capabilities.length > 0 ? capabilities : ['conversation'],
                    initialTrainingData: initialTraining,
                  });

                  // Reset form and close dialog
                  setSpawnForm({ name: '', specialization: '', capabilities: '', initialTraining: '' });
                  setShowSpawnDialog(false);

                  // Optionally select the newly spawned agent
                  setSelectedAgent({
                    id: spawnedAgent.id,
                    name: spawnedAgent.name,
                    type: "spawned" as any,
                    status: "idle",
                    capabilities: spawnedAgent.capabilities,
                    isActive: true,
                  });
                } catch (error) {
                  console.error('Failed to spawn agent:', error);
                }
              }}>
                Spawn Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentConsole;
