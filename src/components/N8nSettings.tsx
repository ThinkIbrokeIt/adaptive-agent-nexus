import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { N8nConfig, getStoredN8nConfig, storeN8nConfig, testN8nConnection } from "@/utils/n8n-api";

interface N8nSettingsProps {
  config?: N8nConfig;
  onConfigChange?: (field: keyof N8nConfig, value: string) => void;
  onLoadWorkflows?: () => Promise<void> | void;
  isLoading?: boolean;
  showIntro?: boolean;
}

const N8nSettings = ({
  config: externalConfig,
  onConfigChange,
  onLoadWorkflows,
  isLoading = false,
  showIntro = false
}: N8nSettingsProps) => {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState<N8nConfig>(getStoredN8nConfig());
  const [isTesting, setIsTesting] = useState(false);

  const config = externalConfig ?? localConfig;

  const updateConfig = (field: keyof N8nConfig, value: string) => {
    if (onConfigChange) {
      onConfigChange(field, value);
      return;
    }

    const nextConfig = { ...config, [field]: value };
    setLocalConfig(nextConfig);
    storeN8nConfig(nextConfig);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testN8nConnection();
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message + (result.version ? ` (n8n ${result.version})` : "")
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {showIntro && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Configure your n8n instance connection for workflow management.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>n8n Connection Settings</CardTitle>
          <CardDescription>
            Configure your n8n instance connection for workflow management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="n8nBaseUrl">n8n Base URL</Label>
              <Input
                id="n8nBaseUrl"
                value={config.baseUrl}
                onChange={(e) => updateConfig("baseUrl", e.target.value)}
                placeholder="http://localhost:5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n8nApiKey">API Key</Label>
              <Input
                id="n8nApiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => updateConfig("apiKey", e.target.value)}
                placeholder="Enter your n8n API key"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={!config.baseUrl || isTesting}
              variant="outline"
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            {onLoadWorkflows && (
              <Button
                onClick={onLoadWorkflows}
                disabled={!config.apiKey || isLoading || isTesting}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading Workflows...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Workflows
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nSettings;
