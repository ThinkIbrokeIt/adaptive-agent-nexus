import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { bootstrapWorkflowsForUser } from '@/utils/workflowBootstrap';
import { getStoredN8nConfig } from '@/utils/n8n-api';

interface WorkflowBootstrapProps {
  onWorkflowLoaded?: (workflowName: string) => void;
  className?: string;
}

export function WorkflowBootstrap({ onWorkflowLoaded, className }: WorkflowBootstrapProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
    errors?: string[];
  } | null>(null);

  const handleBootstrapWorkflows = useCallback(async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const n8nConfig = getStoredN8nConfig();

      if (!n8nConfig.apiKey || n8nConfig.baseUrl === 'http://localhost:5678') {
        setResult({
          success: false,
          message: 'N8N configuration not set. Please configure your N8N instance in settings.'
        });
        return;
      }

      const bootstrapResult = await bootstrapWorkflowsForUser(n8nConfig, {
        autoActivate: true,
        skipExisting: true
      });

      setResult(bootstrapResult);

      // Notify parent component of loaded workflows
      if (bootstrapResult.success && bootstrapResult.importedCount && bootstrapResult.importedCount > 0) {
        onWorkflowLoaded?.('mcp-workflow');
      }

    } catch (error) {
      setResult({
        success: false,
        message: `Bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [onWorkflowLoaded]);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!result) return <Upload className="h-4 w-4" />;
    return result.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'default';
    if (!result) return 'secondary';
    return result.success ? 'default' : 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Workflow Bootstrap
        </CardTitle>
        <CardDescription>
          Load McP workflows into your N8N instance. This enables the full Monitor-Contextualize-Personalize processing pipeline.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Available Workflows</p>
            <div className="flex gap-2">
              <Badge variant="outline">McP Workflow</Badge>
              <Badge variant="outline">Adaptive Agent</Badge>
            </div>
          </div>

          <Button
            onClick={handleBootstrapWorkflows}
            disabled={isLoading}
            variant={getStatusColor()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Bootstrap Workflows
              </>
            )}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{result.message}</p>

                {result.importedCount !== undefined && (
                  <p className="text-sm">
                    Successfully imported {result.importedCount} workflow{result.importedCount !== 1 ? 's' : ''}
                  </p>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Errors:</p>
                    <ul className="text-sm text-red-600 ml-4 list-disc">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>What this does:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Loads workflow definitions from local JSON files</li>
            <li>• Imports them into your configured N8N instance</li>
            <li>• Automatically activates workflows for immediate use</li>
            <li>• Skips workflows that already exist</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Prerequisites:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• N8N instance must be running and accessible</li>
            <li>• Valid API key configured in settings</li>
            <li>• OpenAI API key for AI processing (optional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkflowBootstrap;