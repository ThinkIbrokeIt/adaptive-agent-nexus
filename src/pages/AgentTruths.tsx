import { AgentTruthPanel } from "@/components/AgentTruthPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAgentNetwork } from "@/contexts/AgentNetworkContext";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgentTruths = () => {
  const { network } = useAgentNetwork();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Agent Truth Files</h1>
                <p className="text-sm text-muted-foreground">Core identities and foundational principles</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agent Truth Files</CardTitle>
            <CardDescription>
              View and manage the core identities, truths, and evolution of each agent
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue={network.agents[0]?.id} className="w-full">
          <TabsList className="w-full flex-wrap h-auto">
            {network.agents.map((agent) => (
              <TabsTrigger key={agent.id} value={agent.id} className="flex-1 min-w-[150px]">
                {agent.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {network.agents.map((agent) => (
            <TabsContent key={agent.id} value={agent.id} className="mt-6">
              <AgentTruthPanel agentId={agent.id} agentName={agent.name} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default AgentTruths;
