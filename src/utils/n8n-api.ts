/**
 * n8n API Integration Utilities
 * Provides functions to interact with n8n workflows programmatically
 */

export interface N8nWorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  name: string;
  data: N8nWorkflow;
  createdAt: string;
  createdBy?: string;
  comment?: string;
}

export interface BulkWorkflowOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'export';
  workflowIds: string[];
}

export interface TrainingWorkflowIntegration {
  workflowId: string;
  trainingJobId: string;
  triggerCondition: 'on_completion' | 'on_success' | 'on_failure' | 'manual';
  updateAction: 'replace_model' | 'update_prompt' | 'add_node' | 'modify_connections';
  parameters: Record<string, any>;
}

export class N8nAPI {
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<N8nConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows`, {
      headers: {
        'X-N8N-API-KEY': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows/${id}`, {
      headers: {
        'X-N8N-API-KEY': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.apiKey
      },
      body: JSON.stringify(workflow)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.apiKey
      },
      body: JSON.stringify(workflow)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workflow: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows/${id}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workflow: ${response.statusText}`);
    }
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(id: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows/${id}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to activate workflow: ${response.statusText}`);
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(id: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/rest/workflows/${id}/deactivate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate workflow: ${response.statusText}`);
    }
  }

  /**
   * Create a workflow version (snapshot)
   */
  async createWorkflowVersion(workflowId: string, comment?: string): Promise<N8nWorkflowVersion> {
    const workflow = await this.getWorkflow(workflowId);
    const versions = this.getWorkflowVersions(workflowId);
    const nextVersion = versions.length + 1;

    const version: N8nWorkflowVersion = {
      id: `version-${workflowId}-${nextVersion}`,
      workflowId,
      version: nextVersion,
      name: workflow.name,
      data: workflow,
      createdAt: new Date().toISOString(),
      comment
    };

    const allVersions = [...versions, version];
    localStorage.setItem(`n8n-workflow-versions-${workflowId}`, JSON.stringify(allVersions));

    return version;
  }

  /**
   * Get workflow versions
   */
  getWorkflowVersions(workflowId: string): N8nWorkflowVersion[] {
    const stored = localStorage.getItem(`n8n-workflow-versions-${workflowId}`);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Restore workflow from version
   */
  async restoreWorkflowVersion(workflowId: string, versionId: string): Promise<N8nWorkflow> {
    const versions = this.getWorkflowVersions(workflowId);
    const version = versions.find(v => v.id === versionId);

    if (!version) {
      throw new Error('Version not found');
    }

    return await this.updateWorkflow(workflowId, version.data);
  }

  /**
   * Perform bulk operations on workflows
   */
  async performBulkOperation(operation: BulkWorkflowOperation): Promise<any[]> {
    const results = [];

    for (const workflowId of operation.workflowIds) {
      try {
        switch (operation.operation) {
          case 'activate':
            await this.activateWorkflow(workflowId);
            results.push({ workflowId, success: true, operation: 'activate' });
            break;
          case 'deactivate':
            await this.deactivateWorkflow(workflowId);
            results.push({ workflowId, success: true, operation: 'deactivate' });
            break;
          case 'delete':
            await this.deleteWorkflow(workflowId);
            results.push({ workflowId, success: true, operation: 'delete' });
            break;
          case 'export':
            const workflow = await this.getWorkflow(workflowId);
            results.push({
              workflowId,
              success: true,
              operation: 'export',
              data: workflow
            });
            break;
        }
      } catch (error) {
        results.push({
          workflowId,
          success: false,
          operation: operation.operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Create training-workflow integration
   */
  createTrainingIntegration(integration: TrainingWorkflowIntegration): void {
    const integrations = this.getTrainingIntegrations();
    const existingIndex = integrations.findIndex(i =>
      i.workflowId === integration.workflowId && i.trainingJobId === integration.trainingJobId
    );

    if (existingIndex >= 0) {
      integrations[existingIndex] = integration;
    } else {
      integrations.push(integration);
    }

    localStorage.setItem('n8n-training-integrations', JSON.stringify(integrations));
  }

  /**
   * Get training-workflow integrations
   */
  getTrainingIntegrations(): TrainingWorkflowIntegration[] {
    const stored = localStorage.getItem('n8n-training-integrations');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Remove training integration
   */
  removeTrainingIntegration(workflowId: string, trainingJobId: string): void {
    const integrations = this.getTrainingIntegrations().filter(i =>
      !(i.workflowId === workflowId && i.trainingJobId === trainingJobId)
    );
    localStorage.setItem('n8n-training-integrations', JSON.stringify(integrations));
  }

  /**
   * Trigger workflow update based on training completion
   */
  async triggerTrainingUpdate(trainingJobId: string, trainingResult: any): Promise<void> {
    const integrations = this.getTrainingIntegrations().filter(i => i.trainingJobId === trainingJobId);

    for (const integration of integrations) {
      try {
        const workflow = await this.getWorkflow(integration.workflowId);

        // Create version before updating
        await this.createWorkflowVersion(integration.workflowId,
          `Auto-update from training job ${trainingJobId}`);

        // Apply the update based on the configured action
        const updatedWorkflow = this.applyTrainingUpdate(workflow, integration, trainingResult);

        // Save the updated workflow
        await this.updateWorkflow(integration.workflowId, updatedWorkflow);

      } catch (error) {
        console.error(`Failed to update workflow ${integration.workflowId} from training:`, error);
      }
    }
  }

  /**
   * Apply training result to workflow
   */
  private applyTrainingUpdate(
    workflow: N8nWorkflow,
    integration: TrainingWorkflowIntegration,
    trainingResult: any
  ): N8nWorkflow {
    const updatedWorkflow = { ...workflow };

    switch (integration.updateAction) {
      case 'replace_model':
        // Update AI model references in workflow nodes
        updatedWorkflow.nodes = workflow.nodes.map(node => {
          if (node.type === 'aiTool' && node.parameters?.model) {
            return {
              ...node,
              parameters: {
                ...node.parameters,
                model: trainingResult.modelName || node.parameters.model
              }
            };
          }
          return node;
        });
        break;

      case 'update_prompt':
        // Update prompts in AI nodes
        updatedWorkflow.nodes = workflow.nodes.map(node => {
          if (node.type === 'aiTool' && node.parameters?.prompt) {
            return {
              ...node,
              parameters: {
                ...node.parameters,
                prompt: this.enhancePromptWithTraining(node.parameters.prompt, trainingResult)
              }
            };
          }
          return node;
        });
        break;

      case 'add_node':
        // Add new evaluation or processing node
        const newNode = {
          type: 'function',
          name: `TrainingEnhanced_${Date.now()}`,
          parameters: {
            jsCode: `// Enhanced by training job ${integration.trainingJobId}
// Training result: ${JSON.stringify(trainingResult)}
return { ...$json, trainingEnhanced: true };`
          }
        };
        updatedWorkflow.nodes.push(newNode);
        break;

      case 'modify_connections':
        // Add feedback loop connections based on training
        if (trainingResult.accuracy > 0.8) {
          // Add positive feedback connection
          updatedWorkflow.connections.push({
            source: 'EvaluateEffectiveness',
            target: 'TrainingEnhanced',
            condition: 'accuracy > 0.8'
          });
        }
        break;
    }

    return updatedWorkflow;
  }

  /**
   * Enhance prompt with training insights
   */
  private enhancePromptWithTraining(originalPrompt: string, trainingResult: any): string {
    const enhancement = `
Training-enhanced response (accuracy: ${trainingResult.accuracy?.toFixed(2) || 'N/A'}):
- Focus on ${trainingResult.strengths?.join(', ') || 'improved patterns'}
- Avoid ${trainingResult.weaknesses?.join(', ') || 'previous issues'}

Original prompt:
${originalPrompt}`;

    return enhancement;
  }

  /**
   * Create a default McP workflow template
   */
  createMcPWorkflowTemplate(): Partial<N8nWorkflow> {
    return {
      name: 'Adaptive Agent McP Workflow',
      active: false,
      nodes: [
        {
          type: 'httpRequest',
          name: 'UserInputCapture',
          parameters: {
            url: '{{$localEnv.AGENT_ENDPOINT}}/webhook',
            method: 'POST'
          }
        },
        {
          type: 'function',
          name: 'LogToDatabase',
          parameters: {
            jsCode: `await $storage.write('interactions', {
              input: $json.data.text,
              timestamp: new Date().toISOString(),
              context_flags: $json.metadata?.contextTypes || []
            }); return $json;`
          }
        },
        {
          type: 'aiTool',
          name: 'ProcessWithMcP',
          parameters: {
            service: 'openai',
            model: 'gpt-4',
            prompt: `You are processing an McP (Monitor-Contextualize-Personalize) workflow.
            Analyze the user input and provide a contextual response.

            User Input: {{$json.data.text}}
            Context: {{$json.metadata}}

            Provide a response that demonstrates monitoring, contextualization, and personalization.`
          }
        },
        {
          type: 'function',
          name: 'EvaluateResponse',
          parameters: {
            jsCode: `const evaluation = {
              relevance: Math.random(),
              accuracy: Math.random(),
              personalization: Math.random(),
              timestamp: new Date().toISOString()
            };
            return { ...$json, evaluation };`
          }
        },
        {
          type: 'function',
          name: 'UpdateKnowledgeGraph',
          parameters: {
            jsCode: `if ($json.evaluation.relevance > 0.7) {
              await $graph.addNode({
                type: 'knowledge',
                content: $json.response,
                connections: $json.context || []
              });
            }
            return $json;`
          }
        }
      ],
      connections: [
        { source: 'UserInputCapture', target: 'LogToDatabase' },
        { source: 'LogToDatabase', target: 'ProcessWithMcP' },
        { source: 'ProcessWithMcP', target: 'EvaluateResponse' },
        { source: 'EvaluateResponse', target: 'UpdateKnowledgeGraph' }
      ],
      settings: {}
    };
  }
}

/**
 * Get stored n8n configuration from localStorage
 */
export function getStoredN8nConfig(): N8nConfig {
  return {
    baseUrl: localStorage.getItem('n8n-base-url') || 'http://localhost:5678',
    apiKey: localStorage.getItem('n8n-api-key') || ''
  };
}

/**
 * Store n8n configuration in localStorage
 */
export function storeN8nConfig(config: N8nConfig) {
  localStorage.setItem('n8n-base-url', config.baseUrl);
  localStorage.setItem('n8n-api-key', config.apiKey);
}

/**
 * Create n8n API instance with stored configuration
 */
export function createN8nAPI(): N8nAPI {
  return new N8nAPI(getStoredN8nConfig());
}