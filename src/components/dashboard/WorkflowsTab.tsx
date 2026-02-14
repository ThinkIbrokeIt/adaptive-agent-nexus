
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw, Save, Play, Settings, Eye, Edit, Plus, History, Copy, Download, Upload, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { N8nAPI, N8nWorkflow, N8nConfig, N8nWorkflowVersion, BulkWorkflowOperation, TrainingWorkflowIntegration, getStoredN8nConfig, storeN8nConfig, createN8nAPI, testN8nConnection } from "@/utils/n8n-api";

const WorkflowsTab = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<N8nConfig>(getStoredN8nConfig());
  const [editMode, setEditMode] = useState(false);
  const [workflowJson, setWorkflowJson] = useState('');
  const [n8nAPI] = useState(() => createN8nAPI());

  // Versioning state
  const [workflowVersions, setWorkflowVersions] = useState<N8nWorkflowVersion[]>([]);
  const [versionComment, setVersionComment] = useState('');

  // Bulk operations state
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<BulkWorkflowOperation['operation']>('activate');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Training integration state
  const [trainingIntegrations, setTrainingIntegrations] = useState<TrainingWorkflowIntegration[]>([]);
  const [newIntegration, setNewIntegration] = useState<Partial<TrainingWorkflowIntegration>>({
    triggerCondition: 'on_completion',
    updateAction: 'replace_model'
  });

  useEffect(() => {
    if (config.apiKey) {
      loadWorkflows();
    }
  }, [config]);

  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowVersions(selectedWorkflow.id);
    }
  }, [selectedWorkflow]);

  useEffect(() => {
    loadTrainingIntegrations();
  }, []);

  useEffect(() => {
    if (config.apiKey) {
      loadWorkflows();
    }
  }, [config]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      n8nAPI.updateConfig(config);
      const data = await n8nAPI.getWorkflows();
      setWorkflows(data);
      toast({
        title: "Workflows Loaded",
        description: `Successfully loaded ${data.length} workflows from n8n.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Load Workflows",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsSaving(true);
    try {
      n8nAPI.updateConfig(config);
      const workflowData = JSON.parse(workflowJson);
      const updatedWorkflow = await n8nAPI.updateWorkflow(selectedWorkflow.id, {
        ...selectedWorkflow,
        ...workflowData,
        updatedAt: new Date().toISOString()
      });

      setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      setSelectedWorkflow(updatedWorkflow);
      setEditMode(false);

      toast({
        title: "Workflow Saved",
        description: `Successfully updated workflow "${updatedWorkflow.name}".`,
      });
    } catch (error) {
      toast({
        title: "Failed to Save Workflow",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsTesting(true);
    try {
      n8nAPI.updateConfig(config);
      await n8nAPI.testWorkflow(selectedWorkflow.id);

      toast({
        title: "Workflow Test Successful",
        description: `Workflow "${selectedWorkflow.name}" executed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Workflow Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const createNewWorkflow = async () => {
    const newWorkflow: Partial<N8nWorkflow> = {
      name: 'New Adaptive Agent Workflow',
      active: false,
      nodes: [
        {
          type: 'httpRequest',
          name: 'UserInputCapture',
          parameters: {
            url: '{{$localEnv.AGENT_ENDPOINT}}/webhook',
            method: 'POST'
          }
        }
      ],
      connections: [],
      settings: {}
    };

    try {
      n8nAPI.updateConfig(config);
      const createdWorkflow = await n8nAPI.createWorkflow(newWorkflow);
      setWorkflows([...workflows, createdWorkflow]);
      setSelectedWorkflow(createdWorkflow);
      setWorkflowJson(JSON.stringify(createdWorkflow, null, 2));
      setEditMode(true);

      toast({
        title: "Workflow Created",
        description: `New workflow "${createdWorkflow.name}" created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Create Workflow",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const updateConfig = (field: keyof N8nConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    storeN8nConfig(newConfig);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testN8nConnection();
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message + (result.version ? ` (n8n ${result.version})` : ''),
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Test Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectWorkflow = (workflow: N8nWorkflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowJson(JSON.stringify(workflow, null, 2));
    setEditMode(false);
  };

  // Versioning functions
  const loadWorkflowVersions = (workflowId: string) => {
    const versions = n8nAPI.getWorkflowVersions(workflowId);
    setWorkflowVersions(versions);
  };

  const createWorkflowVersion = async () => {
    if (!selectedWorkflow) return;

    try {
      const version = await n8nAPI.createWorkflowVersion(selectedWorkflow.id, versionComment);
      setWorkflowVersions([...workflowVersions, version]);
      setVersionComment('');

      toast({
        title: "Version Created",
        description: `Version ${version.version} of "${selectedWorkflow.name}" saved.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Create Version",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const restoreWorkflowVersion = async (versionId: string) => {
    if (!selectedWorkflow) return;

    try {
      const restoredWorkflow = await n8nAPI.restoreWorkflowVersion(selectedWorkflow.id, versionId);
      setSelectedWorkflow(restoredWorkflow);
      setWorkflowJson(JSON.stringify(restoredWorkflow, null, 2));
      loadWorkflowVersions(selectedWorkflow.id);

      toast({
        title: "Version Restored",
        description: `Workflow restored to previous version.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Restore Version",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Bulk operations functions
  const handleWorkflowSelection = (workflowId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkflowIds([...selectedWorkflowIds, workflowId]);
    } else {
      setSelectedWorkflowIds(selectedWorkflowIds.filter(id => id !== workflowId));
    }
  };

  const executeBulkOperation = async () => {
    if (selectedWorkflowIds.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const operation: BulkWorkflowOperation = {
        operation: bulkOperation,
        workflowIds: selectedWorkflowIds
      };

      const results = await n8nAPI.performBulkOperation(operation);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Refresh workflows list
      await loadWorkflows();
      setSelectedWorkflowIds([]);

      toast({
        title: "Bulk Operation Complete",
        description: `${successCount} successful, ${failureCount} failed.`,
      });

      if (bulkOperation === 'export' && successCount > 0) {
        // Download exported workflows
        const exportData = results.filter(r => r.success && r.operation === 'export');
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `n8n-workflows-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: "Bulk Operation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Training integration functions
  const loadTrainingIntegrations = () => {
    const integrations = n8nAPI.getTrainingIntegrations();
    setTrainingIntegrations(integrations);
  };

  const createTrainingIntegration = () => {
    if (!newIntegration.workflowId || !newIntegration.trainingJobId) {
      toast({
        title: "Invalid Integration",
        description: "Please select both workflow and training job.",
        variant: "destructive",
      });
      return;
    }

    n8nAPI.createTrainingIntegration(newIntegration as TrainingWorkflowIntegration);
    loadTrainingIntegrations();
    setNewIntegration({
      triggerCondition: 'on_completion',
      updateAction: 'replace_model'
    });

    toast({
      title: "Integration Created",
      description: "Training-workflow integration configured successfully.",
    });
  };

  const removeTrainingIntegration = (workflowId: string, trainingJobId: string) => {
    n8nAPI.removeTrainingIntegration(workflowId, trainingJobId);
    loadTrainingIntegrations();

    toast({
      title: "Integration Removed",
      description: "Training-workflow integration removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">n8n Workflow Management</h2>
        <Badge variant="secondary">Production Ready</Badge>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Configure and manage n8n workflows for your adaptive agent system. Workflows handle McP processing, data routing, and agent coordination.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="training">Training Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
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
                  <Label htmlFor="baseUrl">n8n Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={config.baseUrl}
                    onChange={(e) => updateConfig('baseUrl', e.target.value)}
                    placeholder="http://localhost:5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => updateConfig('apiKey', e.target.value)}
                    placeholder="Enter your n8n API key"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  disabled={!config.baseUrl || isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
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
                <Button
                  onClick={loadWorkflows}
                  disabled={!config.apiKey || isLoading}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Available Workflows</h3>
            <Button onClick={createNewWorkflow} disabled={!config.apiKey}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>

          {workflows.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center py-4">
                  {config.apiKey ? 'No workflows found. Create your first workflow.' : 'Configure n8n connection to load workflows.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className={`cursor-pointer transition-colors ${
                    selectedWorkflow?.id === workflow.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectWorkflow(workflow)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedWorkflowIds.includes(workflow.id)}
                          onCheckedChange={(checked) => {
                            handleWorkflowSelection(workflow.id, checked as boolean);
                            // Prevent card selection when clicking checkbox
                            event?.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                      </div>
                      <Badge variant={workflow.active ? 'default' : 'secondary'}>
                        {workflow.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {workflow.nodes?.length || 0} nodes • Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWorkflow(workflow);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWorkflow(workflow);
                          setEditMode(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <CardDescription>
                      {editMode ? 'Edit workflow configuration' : 'View workflow details'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={testWorkflow}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      Test
                    </Button>
                    {editMode ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveWorkflow}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <Textarea
                    value={workflowJson}
                    onChange={(e) => setWorkflowJson(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="Enter workflow JSON configuration..."
                  />
                ) : (
                  <pre className="bg-slate-900 p-4 rounded-md text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
                    {workflowJson}
                  </pre>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center py-4">
                  Select a workflow from the Workflows tab to view or edit its configuration.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Version History - {selectedWorkflow.name}
                </CardTitle>
                <CardDescription>
                  Track changes and restore previous versions of this workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Version comment (optional)"
                    value={versionComment}
                    onChange={(e) => setVersionComment(e.target.value)}
                  />
                  <Button onClick={createWorkflowVersion} disabled={!selectedWorkflow}>
                    <Copy className="h-4 w-4 mr-2" />
                    Create Version
                  </Button>
                </div>

                <div className="space-y-2">
                  {workflowVersions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No versions saved yet</p>
                  ) : (
                    workflowVersions
                      .sort((a, b) => b.version - a.version)
                      .map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Version {version.version}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(version.createdAt).toLocaleString()}
                              {version.comment && ` • ${version.comment}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreWorkflowVersion(version.id)}
                          >
                            Restore
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 text-center py-4">
                  Select a workflow to view its version history.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bulk Operations
              </CardTitle>
              <CardDescription>
                Perform operations on multiple workflows simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <Select value={bulkOperation} onValueChange={(value: BulkWorkflowOperation['operation']) => setBulkOperation(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate Workflows</SelectItem>
                    <SelectItem value="deactivate">Deactivate Workflows</SelectItem>
                    <SelectItem value="delete">Delete Workflows</SelectItem>
                    <SelectItem value="export">Export Workflows</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={executeBulkOperation}
                  disabled={selectedWorkflowIds.length === 0 || isBulkProcessing}
                >
                  {isBulkProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute ({selectedWorkflowIds.length})
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={workflow.id}
                      checked={selectedWorkflowIds.includes(workflow.id)}
                      onCheckedChange={(checked) => handleWorkflowSelection(workflow.id, checked as boolean)}
                    />
                    <label htmlFor={workflow.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{workflow.name}</span>
                        <Badge variant={workflow.active ? 'default' : 'secondary'}>
                          {workflow.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {workflow.nodes?.length || 0} nodes • Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Training-Workflow Integration
              </CardTitle>
              <CardDescription>
                Automatically update workflows based on local training job results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Workflow</Label>
                  <Select
                    value={newIntegration.workflowId || ''}
                    onValueChange={(value) => setNewIntegration({ ...newIntegration, workflowId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Training Job</Label>
                  <Input
                    placeholder="Training job ID"
                    value={newIntegration.trainingJobId || ''}
                    onChange={(e) => setNewIntegration({ ...newIntegration, trainingJobId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Condition</Label>
                  <Select
                    value={newIntegration.triggerCondition || 'on_completion'}
                    onValueChange={(value: TrainingWorkflowIntegration['triggerCondition']) =>
                      setNewIntegration({ ...newIntegration, triggerCondition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_completion">On Completion</SelectItem>
                      <SelectItem value="on_success">On Success</SelectItem>
                      <SelectItem value="on_failure">On Failure</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Update Action</Label>
                  <Select
                    value={newIntegration.updateAction || 'replace_model'}
                    onValueChange={(value: TrainingWorkflowIntegration['updateAction']) =>
                      setNewIntegration({ ...newIntegration, updateAction: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replace_model">Replace Model</SelectItem>
                      <SelectItem value="update_prompt">Update Prompt</SelectItem>
                      <SelectItem value="add_node">Add Processing Node</SelectItem>
                      <SelectItem value="modify_connections">Modify Connections</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={createTrainingIntegration}>
                <Plus className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>
                Current training-workflow integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingIntegrations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No integrations configured</p>
              ) : (
                <div className="space-y-2">
                  {trainingIntegrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          Workflow: {workflows.find(w => w.id === integration.workflowId)?.name || integration.workflowId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Training Job: {integration.trainingJobId} •
                          Trigger: {integration.triggerCondition} •
                          Action: {integration.updateAction}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTrainingIntegration(integration.workflowId, integration.trainingJobId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowsTab;
