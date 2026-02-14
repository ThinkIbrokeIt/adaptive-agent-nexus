import { N8nAPI, N8nWorkflow } from './n8n-api';

// Embedded workflow definitions for browser compatibility
const MCP_WORKFLOW_JSON = {
  "name": "Adaptive Agent McP Workflow",
  "active": false,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "user-input-capture",
      "name": "User Input Capture",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "mcp-webhook"
    },
    {
      "parameters": {
        "functionCode": "const input = $json;\n\n// Log interaction for monitoring\nconsole.log('McP Workflow: User input received', {\n  text: input.data?.text,\n  timestamp: new Date().toISOString(),\n  contextTypes: input.metadata?.contextTypes\n});\n\n// Add monitoring metadata\ninput.monitoring = {\n  receivedAt: new Date().toISOString(),\n  source: 'mcp-workflow',\n  confidence: Math.random() // Simulated confidence score\n};\n\nreturn input;"
      },
      "id": "monitor-phase",
      "name": "Monitor Phase",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "functionCode": "// Contextualize phase - enrich with semantic search\n\nconst input = $json;\nconst userText = input.data?.text || '';\n\n// Simulated semantic search for context enrichment\n// In production, this would call a vector database or search API\nconst contextResults = [\n  { type: 'similar_interaction', content: 'Previous user asked about AI', relevance: 0.85 },\n  { type: 'knowledge_base', content: 'AI systems learn from data patterns', relevance: 0.72 },\n  { type: 'user_profile', content: 'User prefers technical explanations', relevance: 0.91 }\n];\n\n// Filter high-relevance context\ninput.context = contextResults.filter(item => item.relevance > 0.7);\n\nconsole.log('McP Workflow: Context enriched', {\n  originalText: userText,\n  contextItems: input.context.length\n});\n\nreturn input;"
      },
      "id": "contextualize-phase",
      "name": "Contextualize Phase",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "model": "gpt-4",
        "messages": [
          {
            "role": "system",
            "content": "You are an intelligent agent processing a Monitor-Contextualize-Personalize (McP) workflow. Your task is to provide personalized, context-aware responses based on the user's input and the context provided."
          },
          {
            "role": "user",
            "content": "User Input: {{$json.data.text}}\n\nContext Information:\n{{$json.context}}\n\nMonitoring Data:\n{{$json.monitoring}}\n\nProvide a personalized response that demonstrates understanding of the user's needs and context."
          }
        ],
        "options": {}
      },
      "id": "personalize-phase",
      "name": "Personalize Phase (AI)",
      "type": "n8n-nodes-base.openAi",
      "typeVersion": 1,
      "position": [900, 300],
      "credentials": {
        "openAiApi": {
          "id": "openai-credential",
          "name": "OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "// Evaluate response effectiveness\nconst response = $json;\n\n// Simulated evaluation metrics\nresponse.evaluation = {\n  relevance: Math.random(),\n  accuracy: Math.random(),\n  personalization: Math.random(),\n  userSatisfaction: Math.random(),\n  timestamp: new Date().toISOString()\n};\n\n// Determine if response meets quality thresholds\nconst qualityScore = (\n  response.evaluation.relevance +\n  response.evaluation.accuracy +\n  response.evaluation.personalization\n) / 3;\n\nresponse.evaluation.qualityScore = qualityScore;\nresponse.evaluation.passedThreshold = qualityScore > 0.7;\n\nconsole.log('McP Workflow: Response evaluated', {\n  qualityScore: qualityScore.toFixed(2),\n  passed: response.evaluation.passedThreshold\n});\n\nreturn response;"
      },
      "id": "evaluate-response",
      "name": "Evaluate Response",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "functionCode": "// Feedback loop - update agent knowledge\n\nconst evaluation = $json.evaluation;\nconst userInput = $json.data?.text;\nconst aiResponse = $json.choices?.[0]?.message?.content;\n\n// Only update knowledge if response quality is good\nif (evaluation.passedThreshold) {\n  console.log('McP Workflow: Updating knowledge base', {\n    input: userInput?.substring(0, 50) + '...',\n    qualityScore: evaluation.qualityScore\n  });\n  \n  // In production, this would update a vector database\n  // or send feedback to a learning system\n  \n  $json.feedback = {\n    action: 'knowledge_updated',\n    timestamp: new Date().toISOString(),\n    qualityScore: evaluation.qualityScore\n  };\n} else {\n  console.log('McP Workflow: Response quality below threshold, skipping knowledge update');\n  \n  $json.feedback = {\n    action: 'quality_check_failed',\n    timestamp: new Date().toISOString(),\n    qualityScore: evaluation.qualityScore\n  };\n}\n\nreturn $json;"
      },
      "id": "feedback-loop",
      "name": "Feedback Loop",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1340, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "=$json",
        "options": {}
      },
      "id": "return-response",
      "name": "Return Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1560, 300]
    }
  ],
  "connections": {
    "User Input Capture": {
      "main": [
        [
          {
            "node": "Monitor Phase",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Monitor Phase": {
      "main": [
        [
          {
            "node": "Contextualize Phase",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Contextualize Phase": {
      "main": [
        [
          {
            "node": "Personalize Phase (AI)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Personalize Phase (AI)": {
      "main": [
        [
          {
            "node": "Evaluate Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Evaluate Response": {
      "main": [
        [
          {
            "node": "Feedback Loop",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Feedback Loop": {
      "main": [
        [
          {
            "node": "Return Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "meta": {
    "instanceId": "mcp-workflow-instance"
  },
  "tags": ["mcp", "adaptive-agent", "ai-workflow"]
};

export interface WorkflowBootstrapConfig {
  autoActivate: boolean;
  skipExisting: boolean;
}

/**
 * Bootstrap workflows from embedded definitions into N8N
 */
export class WorkflowBootstrapper {
  private n8nApi: N8nAPI;
  private config: WorkflowBootstrapConfig;

  constructor(n8nApi: N8nAPI, config: Partial<WorkflowBootstrapConfig> = {}) {
    this.n8nApi = n8nApi;
    this.config = {
      autoActivate: true,
      skipExisting: true,
      ...config
    };
  }

  /**
   * Get embedded workflow definitions
   */
  private getEmbeddedWorkflows(): Array<{ name: string; data: any }> {
    return [
      {
        name: 'Adaptive Agent McP Workflow',
        data: MCP_WORKFLOW_JSON
      }
    ];
  }

  /**
   * Check if a workflow with the same name already exists
   */
  private async workflowExists(workflowName: string): Promise<boolean> {
    try {
      const workflows = await this.n8nApi.getWorkflows();
      return workflows.some(w => w.name === workflowName);
    } catch (error) {
      console.error('Failed to check existing workflows:', error);
      return false;
    }
  }

  /**
   * Bootstrap all embedded workflows to N8N
   */
  async bootstrapWorkflows(): Promise<{
    success: boolean;
    imported: string[];
    skipped: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      imported: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };

    const embeddedWorkflows = this.getEmbeddedWorkflows();

    if (embeddedWorkflows.length === 0) {
      console.log('No embedded workflows found to bootstrap');
      return result;
    }

    console.log(`Found ${embeddedWorkflows.length} embedded workflow(s) to process`);

    for (const { name, data } of embeddedWorkflows) {
      try {
        // Check if workflow already exists
        if (this.config.skipExisting && await this.workflowExists(name)) {
          console.log(`Skipping existing workflow: ${name}`);
          result.skipped.push(name);
          continue;
        }

        // Import the workflow
        console.log(`Importing workflow: ${name}`);
        const importedWorkflow = await this.n8nApi.importWorkflow(data);

        result.imported.push(importedWorkflow.name);

        // Auto-activate if configured
        if (this.config.autoActivate && !importedWorkflow.active) {
          try {
            await this.n8nApi.activateWorkflow(importedWorkflow.id);
            console.log(`Activated workflow: ${importedWorkflow.name}`);
          } catch (activateError) {
            console.error(`Failed to activate workflow ${importedWorkflow.name}:`, activateError);
            result.errors.push(`Failed to activate ${importedWorkflow.name}: ${activateError}`);
          }
        }

      } catch (error) {
        const errorMsg = `Failed to import ${name}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    console.log(`Bootstrap complete. Imported: ${result.imported.length}, Skipped: ${result.skipped.length}, Errors: ${result.errors.length}`);

    return result;
  }

  /**
   * Bootstrap the default McP workflow
   */
  async createDefaultMcPWorkflow(): Promise<N8nWorkflow> {
    const importedWorkflow = await this.n8nApi.importWorkflow(MCP_WORKFLOW_JSON);

    if (this.config.autoActivate) {
      await this.n8nApi.activateWorkflow(importedWorkflow.id);
    }

    return importedWorkflow;
  }
}

/**
 * Quick bootstrap function for frontend use
 */
export async function bootstrapWorkflowsForUser(
  n8nConfig: { baseUrl: string; apiKey: string },
  options: Partial<WorkflowBootstrapConfig> = {}
): Promise<{
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}> {
  try {
    const n8nApi = new N8nAPI(n8nConfig);
    const bootstrapper = new WorkflowBootstrapper(n8nApi, options);

    const result = await bootstrapper.bootstrapWorkflows();

    return {
      success: result.success,
      message: result.success
        ? `Successfully imported ${result.imported.length} workflow${result.imported.length !== 1 ? 's' : ''}`
        : `Bootstrap completed with errors. Imported: ${result.imported.length}, Errors: ${result.errors.length}`,
      importedCount: result.imported.length,
      errors: result.errors.length > 0 ? result.errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: `Bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}