
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkflowsTab = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>n8n Workflow Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900 p-4 rounded-md text-xs font-mono overflow-x-auto">
          {`{
  "nodes": [
    {
      "type": "httpRequest",
      "name": "UserInputCapture",
      "parameters": {
        "url": "{{$localEnv.AGENT_ENDPOINT}}/webhook",
        "method": "POST"
      }
    },
    {
      "type": "function",
      "name": "LogToDuckDB",
      "parameters": {
        "jsCode": "await $storage.write('interactions', { 
          input: $json.data.text,
          timestamp: new Date().toISOString(),
          context_flags: $json.metadata.contextTypes 
        }); return $json;"
      }
    },
    {
      "type": "aiTool",
      "name": "GenerateLessonPlan",
      "parameters": {
        "service": "local-ollama",
        "model": "llama3:instruct",
        "prompt": "Based on {{$json.context}} and user's {{$json.goals}}, create a personalized lesson plan with..."
      }
    },
    {
      "type": "function",
      "name": "EvaluateEffectiveness",
      "parameters": {
        "jsCode": "const score = await $ai.evaluate($json.response, {
          criteria: ['relevance', 'accuracy', 'personalization'],
          threshold: 0.75
        }); return { ...json, evaluation: score };"
      }
    },
    {
      "type": "function",
      "name": "UpdateKnowledgeGraph",
      "parameters": {
        "jsCode": "if ($json.evaluation.score > 0.8) {
          await $graph.addNode({
            type: 'knowledge',
            content: $json.response,
            connections: $json.context.map(c => ({ id: c.id, weight: c.relevance }))
          });
        }
        return $json;"
      }
    },
    {
      "type": "if",
      "name": "RequiresAdaptation",
      "parameters": {
        "condition": "{{$json.evaluation.score < 0.75}}"
      }
    },
    {
      "type": "aiTool",
      "name": "ImproveModel",
      "parameters": {
        "service": "local-ollama",
        "model": "llama3:instruct",
        "action": "finetune",
        "data": "{{$json.historyWithEvaluations}}",
        "parameters": {
          "epochs": 3,
          "learning_rate": 0.00002
        }
      }
    }
  ],
  "connections": [
    {
      "source": "UserInputCapture",
      "target": "LogToDuckDB"
    },
    {
      "source": "LogToDuckDB",
      "target": "GenerateLessonPlan"
    },
    {
      "source": "GenerateLessonPlan",
      "target": "EvaluateEffectiveness"
    },
    {
      "source": "EvaluateEffectiveness",
      "target": "UpdateKnowledgeGraph"
    },
    {
      "source": "EvaluateEffectiveness",
      "target": "RequiresAdaptation"
    },
    {
      "source": "RequiresAdaptation",
      "target": "ImproveModel",
      "condition": "true"
    },
    {
      "source": "ImproveModel",
      "target": "UserInputCapture",
      "label": "Feedback Loop"
    }
  ]
}`}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowsTab;
