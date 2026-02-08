import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Database, TestTube, CheckCircle, XCircle, HardDrive, Cloud, Cpu, FolderOpen } from "lucide-react";
import { storageConfigManager, StorageConfig, StorageTestResult, DEFAULT_STORAGE_CONFIGS } from "@/lib/storageConfig";
import { useToast } from "@/hooks/use-toast";

export const StorageSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);

  // Form state
  const [provider, setProvider] = useState<string>('localStorage');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [databaseName, setDatabaseName] = useState<string>('adaptive-agent-db');
  const [storagePath, setStoragePath] = useState<string>('./adaptive-agent-data');
  const [enableEncryption, setEnableEncryption] = useState<boolean>(false);
  const [maxStorageSize, setMaxStorageSize] = useState<number>(50);

  // Load configuration on mount - intentionally runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadConfig = () => {
      const currentConfig = storageConfigManager.getConfig();
      if (currentConfig) {
        setConfig(currentConfig);
        setProvider(currentConfig.provider);
        setSupabaseUrl(currentConfig.supabaseUrl || '');
        setSupabaseKey(currentConfig.supabaseKey || '');
        setDatabaseName(currentConfig.databaseName || 'adaptive-agent-db');
        setStoragePath(currentConfig.storagePath || './adaptive-agent-data');
        setEnableEncryption(currentConfig.enableEncryption || false);
        setMaxStorageSize(currentConfig.maxStorageSize || 50);
      } else {
        // Set default localStorage config
        const defaultConfig: StorageConfig = {
          provider: 'localStorage',
          enableEncryption: false,
          maxStorageSize: 50,
        };
        storageConfigManager.saveConfig(defaultConfig);
        setConfig(defaultConfig);
        setProvider(defaultConfig.provider);
        setEnableEncryption(defaultConfig.enableEncryption);
        setMaxStorageSize(defaultConfig.maxStorageSize);
      }
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const defaultConfig = DEFAULT_STORAGE_CONFIGS[newProvider as keyof typeof DEFAULT_STORAGE_CONFIGS];
    if (defaultConfig) {
      setSupabaseUrl('');
      setSupabaseKey('');
      setDatabaseName('adaptive-agent-db');
      setStoragePath(defaultConfig.storagePath || './adaptive-agent-data');
      setEnableEncryption(defaultConfig.enableEncryption || false);
      setMaxStorageSize(defaultConfig.maxStorageSize || 50);
    }
  };

  const handleSave = () => {
    const newConfig: StorageConfig = {
      provider: provider as StorageConfig['provider'],
      supabaseUrl: supabaseUrl || undefined,
      supabaseKey: supabaseKey || undefined,
      databaseName: databaseName || undefined,
      storagePath: storagePath || undefined,
      enableEncryption,
      maxStorageSize,
    };

    try {
      storageConfigManager.saveConfig(newConfig);
      setConfig(newConfig);
      toast({
        title: "Settings Saved",
        description: "Storage configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save storage configuration.",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await storageConfigManager.testConnection();
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Storage system is working correctly.",
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
        description: "Failed to test storage connection.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
            <Database className="h-5 w-5" />
            Storage Configuration
          </CardTitle>
          <CardDescription>
            Configure your data storage settings for agent knowledge and interactions.
            Choose between local storage, cloud databases, or mock storage for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Storage Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="localStorage">Local Storage (Browser)</SelectItem>
                <SelectItem value="indexeddb">IndexedDB (Browser)</SelectItem>
                <SelectItem value="filesystem">File System (Local Disk)</SelectItem>
                <SelectItem value="supabase">Supabase (Cloud)</SelectItem>
                <SelectItem value="mock">Mock (Testing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File System Configuration */}
          {provider === 'filesystem' && (
            <div className="space-y-2">
              <Label htmlFor="storagePath">Storage Directory</Label>
              <div className="flex gap-2">
                <Input
                  id="storagePath"
                  placeholder="./adaptive-agent-data"
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      if (typeof window !== 'undefined' && window.electronAPI) {
                        const selectedPath = await window.electronAPI.showDirectoryPicker();
                        if (selectedPath) {
                          setStoragePath(selectedPath);
                        }
                      } else {
                        // Browser fallback - show message
                        toast({
                          title: "Directory Selection",
                          description: "Directory picker only available in desktop app. Please enter path manually.",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Selection Failed",
                        description: "Failed to select directory.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Browse
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Directory path for storing agent data. Relative to app directory, or absolute path.
                In Electron: uses actual file system. In browser: falls back to IndexedDB.
              </p>
            </div>
          )}

          {/* Encryption Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="encryption"
              checked={enableEncryption}
              onCheckedChange={setEnableEncryption}
              disabled={provider === 'mock'}
            />
            <Label htmlFor="encryption">Enable Data Encryption</Label>
          </div>

          {/* Max Storage Size */}
          <div className="space-y-2">
            <Label htmlFor="maxStorageSize">Max Storage Size: {maxStorageSize} MB</Label>
            <Input
              id="maxStorageSize"
              type="range"
              min="10"
              max="1000"
              step="10"
              value={maxStorageSize}
              onChange={(e) => setMaxStorageSize(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Maximum storage size for agent data and knowledge base
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
                {testResult.success ? (
                  <div>
                    <p>Storage connection successful!</p>
                    {testResult.storageInfo && (
                      <div className="mt-2 text-xs">
                        <p>Used: {formatBytes(testResult.storageInfo.used)}</p>
                        <p>Available: {formatBytes(testResult.storageInfo.available)}</p>
                        <p>Total: {formatBytes(testResult.storageInfo.total)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  `Connection failed: ${testResult.error}`
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Provider Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider === 'localStorage' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Local Storage (Browser)
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Uses your browser's localStorage for data persistence. Data is stored locally on your device
                and persists between sessions. Perfect for personal use and privacy.
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <p>• No external dependencies</p>
                <p>• Data stays on your device</p>
                <p>• Limited to ~5-10MB per origin</p>
              </div>
            </div>
          )}

          {provider === 'indexeddb' && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                <Database className="h-4 w-4" />
                IndexedDB (Browser)
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Advanced browser storage with larger capacity and structured data support.
                Better performance for complex data operations.
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <p>• Larger storage capacity (~500MB+)</p>
                <p>• Structured data support</p>
                <p>• Asynchronous operations</p>
              </div>
            </div>
          )}

          {provider === 'filesystem' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                File System (Local Disk)
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Store data directly on your local hard disk or removable storage.
                Maximum capacity and performance for large datasets.
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <p>• Unlimited storage capacity</p>
                <p>• Direct file system access (Electron)</p>
                <p>• Removable storage support</p>
                <p>• Best performance for large data</p>
              </div>
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                <strong>Note:</strong> In browser mode, falls back to IndexedDB.
                Use desktop app for full file system access.
              </div>
            </div>
          )}

          {provider === 'supabase' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Supabase (Cloud)
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Cloud-hosted PostgreSQL database with real-time capabilities.
                Perfect for multi-device synchronization and collaboration.
              </p>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <p>• Real-time data synchronization</p>
                <p>• Multi-device access</p>
                <p>• Advanced querying capabilities</p>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Setup: <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a>
              </p>
            </div>
          )}

          {provider === 'mock' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Mock Storage (Testing)
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Simulated storage for testing and development. No data persistence.
                Perfect for trying out features without committing to a storage solution.
              </p>
              <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                <p>• No data persistence</p>
                <p>• Fast operations</p>
                <p>• Development and testing only</p>
              </div>
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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{config.provider.toUpperCase()}</Badge>
              <Badge variant="outline">{maxStorageSize}MB Limit</Badge>
              {enableEncryption && <Badge variant="outline">Encrypted</Badge>}
              {testResult?.storageInfo && (
                <Badge variant="outline">
                  Used: {formatBytes(testResult.storageInfo.used)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};