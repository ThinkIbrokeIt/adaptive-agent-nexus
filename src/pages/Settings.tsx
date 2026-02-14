import { Settings as SettingsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import N8nSettings from "@/components/N8nSettings";
import { LLMSettings } from "@/components/LLMSettings";
import { StorageSettings } from "@/components/StorageSettings";
import WorkflowBootstrap from "@/components/WorkflowBootstrap";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Settings</h2>
          <Badge variant="secondary">Initial Setup</Badge>
        </div>

        <Tabs defaultValue="n8n" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-800/50 h-auto">
            <TabsTrigger value="n8n" className="text-xs md:text-sm">n8n Connection</TabsTrigger>
            <TabsTrigger value="llm" className="text-xs md:text-sm">LLM</TabsTrigger>
            <TabsTrigger value="storage" className="text-xs md:text-sm">Storage</TabsTrigger>
            <TabsTrigger value="bootstrap" className="text-xs md:text-sm">Workflow Bootstrap</TabsTrigger>
          </TabsList>

          <TabsContent value="n8n">
            <N8nSettings showIntro />
          </TabsContent>

          <TabsContent value="llm">
            <LLMSettings />
          </TabsContent>

          <TabsContent value="storage">
            <StorageSettings />
          </TabsContent>

          <TabsContent value="bootstrap">
            <WorkflowBootstrap />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
