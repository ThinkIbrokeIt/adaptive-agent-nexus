import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, TestTube, CheckCircle, XCircle } from "lucide-react";
import { llmConfigManager, LLMConfig } from "@/lib/llmConfig";
import { DEFAULT_CONFIGS } from "@/lib/llm";
import { useToast } from "@/hooks/use-toast";

export const LLMSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Form state
  const [provider, setProvider] = useState<string>('mock');
  const [apiKey, setApiKey] = useState<string>('');
  const [baseURL, setBaseURL] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2000);

  // Load configuration on mount - intentionally runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadConfig = () => {
      const currentConfig = llmConfigManager.getConfig();
      if (currentConfig) {
        setConfig(currentConfig);
        setProvider(currentConfig.provider);
        setApiKey(currentConfig.apiKey || '');
        setBaseURL(currentConfig.baseURL || '');
        setModel(currentConfig.model || '');
        setTemperature(currentConfig.temperature || 0.7);
        setMaxTokens(currentConfig.maxTokens || 2000);
      }
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const defaultConfig = DEFAULT_CONFIGS[newProvider as keyof typeof DEFAULT_CONFIGS];
    if (defaultConfig) {
      setBaseURL(defaultConfig.baseURL || '');
      setModel(defaultConfig.model || '');
      setTemperature(defaultConfig.temperature || 0.7);
      setMaxTokens(defaultConfig.maxTokens || 2000);
      setApiKey(''); // Clear API key when switching providers
    }
  };

  const handleSave = () => {
    const newConfig: LLMConfig = {
      provider: provider as any,
      apiKey: apiKey || undefined,
      baseURL: baseURL || undefined,
      model: model || undefined,
      temperature,
      maxTokens,
    };

    try {
      llmConfigManager.saveConfig(newConfig);
      setConfig(newConfig);
      toast({
        title: "Settings Saved",
        description: "LLM configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save LLM configuration.",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await llmConfigManager.testConnection();
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "LLM service is working correctly.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      toast({
        title: "Test Failed",
        description: "Failed to test LLM connection.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const availableModels = llmConfigManager.getAvailableModels(provider);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LLM Configuration
          </CardTitle>
          <CardDescription>
            Configure your Large Language Model settings for enhanced agent responses.
            Choose between cloud providers, local models, or mock responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">LLM Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock (No API Required)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          {provider !== 'mock' && provider !== 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={`Enter your ${provider} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          )}

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseURL">Base URL</Label>
            <Input
              id="baseURL"
              placeholder="https://api.openai.com/v1"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              disabled={provider === 'mock'}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel} disabled={provider === 'mock'}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((modelName) => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature: {temperature}</Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Controls randomness: 0 = deterministic, 2 = very random
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="100"
              max="8000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Maximum length of generated responses
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
            <Button
              onClick={handleTest}
              disabled={isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {testResult.success
                  ? "Connection successful! LLM service is working correctly."
                  : `Connection failed: ${testResult.error}`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider === 'mock' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Mock Provider</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Uses simulated responses for testing. No API key or internet connection required.
                Perfect for development and offline use.
              </p>
            </div>
          )}

          {provider === 'openai' && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100">OpenAI</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Access to GPT models like GPT-4, GPT-3.5-turbo. Requires API key from OpenAI.
                Best for high-quality responses and broad knowledge.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Get API key: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a>
              </p>
            </div>
          )}

          {provider === 'anthropic' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Anthropic</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Access to Claude models. Requires API key from Anthropic.
                Known for safety-focused and helpful responses.
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Get API key: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a>
              </p>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">Ollama (Local)</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Run LLMs locally on your machine. Requires Ollama installation.
                Privacy-focused with no external API calls.
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Install Ollama: <a href="https://ollama.ai/" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Configuration Status */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{config.provider.toUpperCase()}</Badge>
              <Badge variant="outline">{config.model}</Badge>
              <Badge variant="outline">Temp: {config.temperature}</Badge>
              <Badge variant="outline">Max: {config.maxTokens}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};